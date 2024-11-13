package com.example.webchiasetailieu.service;

import com.example.webchiasetailieu.dto.request.DocumentCreationRequest;
import com.example.webchiasetailieu.dto.request.UpdateDocumentRequest;
import com.example.webchiasetailieu.dto.response.DocumentResponse;
import com.example.webchiasetailieu.dto.response.DriveResponse;
import com.example.webchiasetailieu.entity.Account;
import com.example.webchiasetailieu.entity.DocCategory;
import com.example.webchiasetailieu.entity.Documents;
import com.example.webchiasetailieu.exception.AppException;
import com.example.webchiasetailieu.exception.ErrorCode;
import com.example.webchiasetailieu.repository.AccountRepository;
import com.example.webchiasetailieu.repository.DocCategoryRepository;
import com.example.webchiasetailieu.repository.DocumentRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.regex.Pattern;

import java.io.File;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DocumentService {
    DriveService driveService;
    DocCategoryRepository docCategoryRepository;
    AccountRepository accountRepository;
    AccountService accountService;
    DocumentRepository documentRepository;

    //public
    public List<Documents> getAll(){
        if(documentRepository.findAll().isEmpty())
            throw new AppException(ErrorCode.LIST_EMPTY);
        return documentRepository.findAll();
    }

    //public
    public List<Documents> getAllByCategory(DocCategory docCategory){
        return documentRepository.findByCategoryId(docCategory.getId());
    }

    //public
    public DocumentResponse getById(String id){
        return convertToResponse(documentRepository.findById(id).orElseThrow(
                () -> new AppException(ErrorCode.DOC_NOT_EXIST)));
    }

    @PreAuthorize("hasAuthority('UPDATE_DOC')")
    public DocumentResponse updateDocument(String docId, UpdateDocumentRequest request) throws IOException, GeneralSecurityException {
        Documents document = isDocumentOwnedByAccount(docId);

        if (!request.getFile().isEmpty()) {
            document.setUrl(updateFile(request.getFile(), document));
        }
        if (!request.getName().isBlank()) {
            document.setName(request.getName());
        }
        if (!request.getDescription().isBlank()) {
            document.setDescription(request.getDescription());
        }
        if (!request.getType().isBlank()) {
            document.setType(request.getType());
        }
        if (!request.getAvatar().isBlank()) {
            document.setAvatar(request.getAvatar());
        }
        if (!request.getCategoryId().isBlank()) {
            DocCategory docCategory = docCategoryRepository.findById(request.getCategoryId()).orElseThrow(
                    () -> new AppException(ErrorCode.CATEGORY_NOT_EXIST));
            document.setCategory(docCategory);
        }

        return convertToResponse(documentRepository.save(document));
    }

    @PreAuthorize("hasAuthority('UP_FILE')")
    public DriveResponse uploadFile(MultipartFile file, String name, String type, String description,
                                    String docCategoryId,int point, String avatar)
            throws IOException, GeneralSecurityException{
        var context = SecurityContextHolder.getContext();
        String email = context.getAuthentication().getName();
        Account account = accountRepository.findByEmail(email).orElseThrow(
                () -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (file.isEmpty()) {
            throw new AppException(ErrorCode.FILE_EMPTY);
        }

        String originalFileName = file.getOriginalFilename();
        String fileNameWithoutExtension = originalFileName.substring(0, originalFileName.lastIndexOf("."));
        String fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        File tempFile = File.createTempFile(fileNameWithoutExtension, fileExtension);
        file.transferTo(tempFile);
        DriveResponse res = driveService.uploadFileToDrive(tempFile);

        DocCategory docCategory = docCategoryRepository.findById(docCategoryId)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_EXIST));
        DocumentCreationRequest request = DocumentCreationRequest.builder()
                .name(name)
                .type(type)
                .description(description)
                .avatar(avatar)
                .point(point)
                .docUrl(res.getUrl())
                .createdBy(account)
                .category(docCategory)
                .build();
        uploadDocument(request);
        return res;
    }

    @PreAuthorize("hasAuthority('DOWNLOAD')")
    public String download(String docId, String accountId){
        Account account = accountRepository.findById(accountId).orElseThrow(
                () -> new AppException(ErrorCode.USER_NOT_EXISTED));
        Documents documents = documentRepository.findById(docId).orElseThrow(
                () -> new AppException(ErrorCode.DOC_NOT_EXIST));
        if(account.getPoints() < documents.getPoint())
            throw new AppException(ErrorCode.NOT_ENOUGH_POINT_TO_DOWNLOAD);

        boolean check = driveService.downloadFile(documents.getUrl(), documents.getType(),
                removeAccentsAndReplaceSpaces(documents.getName()));
        if(check){
            System.out.println(documents.getPoint());
            accountService.rewardPoint(documents.getCreatedBy().getId(),  documents.getPoint());
            accountService.rewardPoint(accountId, - documents.getPoint());
            return "Successfully downloaded file";
        }
        return "Failed to download file";
    }

    @PreAuthorize("hasAuthority('DELETE_DOC')")
    public String delete(String id) throws GeneralSecurityException, IOException {
        Documents documents = documentRepository.findById(id).orElseThrow(
                () -> new AppException(ErrorCode.DOC_NOT_EXIST));

        String url = documents.getUrl();
//        / Tìm vị trí của "id=" trong chuỗi
        int index = url.indexOf("id=");
        String fieldId = url.substring(index + 3);

        driveService.deleteFileFromDrive(fieldId);

        documentRepository.deleteById(id);
        if(documentRepository.existsById(id))
            return "Failed to delete account";
        else return "Delete successfully";

    }

    @PreAuthorize("hasRole('ADMIN')")
    public String deleteAll(){
        if(documentRepository.findAll().isEmpty())
            throw new AppException(ErrorCode.LIST_EMPTY);
        documentRepository.deleteAll();
        if(!documentRepository.findAll().isEmpty())
            return "Failed to delete all documents";
        return "Delete successfully";
    }

    private DocumentResponse convertToResponse(Documents documents) {
        return DocumentResponse.builder()
                .name(documents.getName())
                .avatar(documents.getAvatar())
                .description(documents.getDescription())
                .type(documents.getType())
                .category(documents.getCategory())
                .email(documents.getCreatedBy().getEmail())
                .downloadTimes(documents.getDownloadTimes())
                .point(documents.getPoint())
                .build();
    }

    private static String removeAccentsAndReplaceSpaces(String input) {
        if (input == null) {
            return null;
        }

        // Bỏ dấu
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        String noAccents = pattern.matcher(normalized).replaceAll("");

        return noAccents.replace(" ", "_");
    }

    private DocumentResponse uploadDocument(DocumentCreationRequest request) throws IOException {
        if(request.getPoint() == 0){
            accountService.rewardPoint(request.getCreatedBy().getId(), 20);
        }
        Documents document = Documents.builder()
                .name(request.getName())
                .type(request.getType())
                .url(request.getDocUrl())
                .description(request.getDescription())
                .category(request.getCategory())
                .point(request.getPoint())
                .createdBy(request.getCreatedBy())
                .createdAt(LocalDateTime.now())
                .avatar(request.getAvatar())
                .downloadTimes(0)
                .build();
        return convertToResponse(documentRepository.save(document));
    }

    private String updateFile(MultipartFile file, Documents document) throws IOException, GeneralSecurityException {
        String url = document.getUrl();
        int index = url.indexOf("id=");
        String fieldId = url.substring(index + 3);
        driveService.deleteFileFromDrive(fieldId);

        String originalFileName = file.getOriginalFilename();
        String fileNameWithoutExtension = originalFileName.substring(0, originalFileName.lastIndexOf("."));
        String fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        File tempFile = File.createTempFile(fileNameWithoutExtension, fileExtension);
        file.transferTo(tempFile);
        DriveResponse res = driveService.uploadFileToDrive(tempFile);
        return res.getUrl();
    }

    private Documents isDocumentOwnedByAccount(String docId){
        var context = SecurityContextHolder.getContext();
        String email = context.getAuthentication().getName();
        Account account = accountRepository.findByEmail(email).orElseThrow(
                () -> new AppException(ErrorCode.USER_NOT_EXISTED));

        List<Documents> documents = documentRepository.findByCreatedBy_Id(account.getId());

        Documents documentToUpdate = documents.stream()
                .filter(doc -> doc.getId().equals(docId))
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.DOC_NOT_EXIST));
        System.out.println(documentToUpdate);
        return documentToUpdate;
    }
}
