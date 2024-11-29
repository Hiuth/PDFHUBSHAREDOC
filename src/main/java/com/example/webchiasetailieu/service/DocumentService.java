package com.example.webchiasetailieu.service;

import com.example.webchiasetailieu.dto.request.DocumentCreationRequest;
import com.example.webchiasetailieu.dto.request.NotificationCreationRequest;
import com.example.webchiasetailieu.dto.request.SendEmailRequest;
import com.example.webchiasetailieu.dto.request.UpdateDocumentRequest;
import com.example.webchiasetailieu.dto.response.*;
import com.example.webchiasetailieu.entity.*;
import com.example.webchiasetailieu.enums.EmailType;
import com.example.webchiasetailieu.enums.NotificationType;
import com.example.webchiasetailieu.exception.AppException;
import com.example.webchiasetailieu.exception.ErrorCode;
import com.example.webchiasetailieu.repository.*;
import jakarta.mail.MessagingException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.security.GeneralSecurityException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.regex.Pattern;

import java.io.File;
import java.io.IOException;
import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class DocumentService {
    DriveService driveService;
    DocCategoryRepository docCategoryRepository;
    AccountRepository accountRepository;
    AccountService accountService;
    DocumentRepository documentRepository;
    MailService mailService;
    DownloadHistoryRepository downloadHistoryRepository;
    NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;
    private final PersonalInformationRepository personalInformationRepository;

    //public
    public List<Documents> getAll(){
        if(documentRepository.findAll().isEmpty())
            throw new AppException(ErrorCode.LIST_EMPTY);
        return documentRepository.findAll();
    }

    //public
    public List<Documents> findDocumentByKeyword(String keyword){
        if(documentRepository.findDocumentsByKeyWord(keyword).isEmpty())
            throw new AppException(ErrorCode.LIST_EMPTY);
        return documentRepository.findDocumentsByKeyWord(keyword);
    }

    //public
    public List<Documents> findDocumentBySubCategory(String keyword){
        if(documentRepository.findDocumentsBySubCategory(keyword).isEmpty())
            throw new AppException(ErrorCode.LIST_EMPTY);
        return documentRepository.findDocumentsBySubCategory(keyword);
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

    //public
    public String getDocAvatar(String id){
        Documents doc = documentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.DOC_NOT_EXIST));
        PersonalInformation personalInformation = personalInformationRepository
                .findByAccountId(doc.getCreatedBy().getId());
        return personalInformation.getAvatar();
    }

    @PreAuthorize("hasAuthority('MY_DOC')")
    public List<Documents> getMyDocuments(){
        return documentRepository.findByCreatedBy_Id(getAccountIdFromContext());
    }

    @PreAuthorize("hasAuthority('UPDATE_DOC')")
    public DocumentResponse updateDocument(String docId, UpdateDocumentRequest request) throws GeneralSecurityException, IOException {
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
            throws GeneralSecurityException, IOException{
        var context = SecurityContextHolder.getContext();
        String email = context.getAuthentication().getName();
        Account account = accountRepository.findByEmail(email).orElseThrow(
                () -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (file.isEmpty()) {
            throw new AppException(ErrorCode.FILE_EMPTY);
        }

        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null || !originalFileName.contains(".")) {
            throw new IllegalArgumentException("File must have a valid name with an extension.");
        }
        String fileNameWithoutExtension = originalFileName.substring(0, originalFileName.lastIndexOf("."));
        String fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        File tempFile = File.createTempFile(fileNameWithoutExtension, fileExtension);
        file.transferTo(tempFile);
        DriveResponse res = driveService.uploadFileToDrive(tempFile);

        if (res.getUrl() == null || res.getUrl().isBlank()) {
            throw new AppException(ErrorCode.DRIVE_UPLOAD_FAILED);
        }

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

        notificationService.notify(NotificationCreationRequest.builder()
                .type(NotificationType.UPLOAD)
                .accountId(account.getId())
                .build());

        notificationService.notify(NotificationCreationRequest.builder()
                .type(NotificationType.RECEIVE_POINTS)
                .accountId(account.getId())
                .build());

        return res;

    }

    @PreAuthorize("hasAuthority('DOWNLOAD')")
    public String download(String docId) throws MessagingException {
        Account account = accountRepository.findById(getAccountIdFromContext()).orElseThrow(
                () -> new AppException(ErrorCode.USER_NOT_EXISTED));
        Documents documents = documentRepository.findById(docId).orElseThrow(
                () -> new AppException(ErrorCode.DOC_NOT_EXIST));
        if(account.getPoints() < documents.getPoint())
            throw new AppException(ErrorCode.NOT_ENOUGH_POINT_TO_DOWNLOAD);

        boolean checkHistoryDownloadOfAccount = downloadHistoryRepository
                .existsByAccountIdAndDocumentId(account.getId(), docId);

        boolean check = driveService.downloadFile(documents.getUrl(), documents.getType(),
                removeAccentsAndReplaceSpaces(documents.getName()));

        if(check){
            accountService.rewardPoint(documents.getCreatedBy().getId(),  documents.getPoint());
            if(!checkHistoryDownloadOfAccount)
                accountService.rewardPoint(account.getId(), - documents.getPoint());

            documents.setDownloadTimes(documents.getDownloadTimes() + 1);
            documentRepository.save(documents);
            if(!mailService.classifyBeforeSendEmail(SendEmailRequest.builder()
                            .email(documents.getCreatedBy().getEmail())
                            .emailType(EmailType.DOWNLOAD)
                            .createBy(documents.getCreatedBy().getName())
                            .docName(documents.getName())
                    .build()))
                throw new AppException(ErrorCode.SEND_EMAIL_FAILED);

            DownloadHistory downloadHistory = DownloadHistory.builder()
                    .account(account)
                    .document(documents)
                    .point(documents.getPoint())
                    .build();
            downloadHistoryRepository.save(downloadHistory);

            notificationService.notify(NotificationCreationRequest.builder()
                            .type(NotificationType.DOWNLOAD)
                            .accountId(documents.getCreatedBy().getId())
                            .accountName(account.getName())
                            .docName(documents.getName())
                    .build());

            return "Successfully downloaded file";
        }
        return "Failed to download file";
    }

    @PreAuthorize("hasAuthority('DELETE_DOC')")
    public String delete(String id) throws GeneralSecurityException, IOException {
        Documents documents = documentRepository.findById(id).orElseThrow(
                () -> new AppException(ErrorCode.DOC_NOT_EXIST));

        String url = documents.getUrl();
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

    @PreAuthorize("hasAuthority('VIEW_DOWN_HISTORY')")
    public List<DownloadHistory> getMyDownloadHistory(){
        return downloadHistoryRepository.findByAccount_Id(getAccountIdFromContext());
    }

    @PreAuthorize("hasRole('ADMIN')")
    public long numberOfDocuments(){
        return documentRepository.count();
    }

    @PreAuthorize("hasRole('ADMIN')")
    public long getTotalDownloadsToday(){
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.plusDays(1).atStartOfDay();
        return downloadHistoryRepository.countDownloadsToday(startOfDay, endOfDay);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<MonthlyDownloadStatsResponse> getDownloadsByMonth() {
        int currentYear = LocalDateTime.now().getYear();

        List<Object[]> rawStats = downloadHistoryRepository.countDownloadsByMonth(currentYear);

        return rawStats.stream()
                .map(record -> new MonthlyDownloadStatsResponse(
                        (int) record[0],
                        (long) record[1]
                ))
                .toList();
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<DocumentTypeCountResponse> getDocumentTypeCounts() {
        List<Object[]> counts = documentRepository.countDocumentsByType();
        if (counts.isEmpty() || counts.get(0).length != 3) {
            throw new IllegalStateException("Invalid result from countDocumentsByType query");
        }

        Object[] countArray = counts.get(0);
        return Arrays.asList(
                new DocumentTypeCountResponse("PDF", ((Number) countArray[0]).longValue()),
                new DocumentTypeCountResponse("Word", ((Number) countArray[1]).longValue()),
                new DocumentTypeCountResponse("Other", ((Number) countArray[2]).longValue())
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<MonthlyUploadStatsResponse> getUploadsByMonth() {
        int currentYear = LocalDateTime.now().getYear();

        List<Object[]> rawStats = documentRepository.countDocumentsByMonth(currentYear);

        return rawStats.stream()
                .map(record -> new MonthlyUploadStatsResponse(
                        (int) record[0],
                        (long) record[1]
                ))
                .toList();
    }

    private DocumentResponse convertToResponse(Documents documents) {
        return DocumentResponse.builder()
                .name(documents.getName())
                .avatar(documents.getAvatar())
                .description(documents.getDescription())
                .type(documents.getType())
                .url(documents.getUrl())
                .category(documents.getCategory())
                .accountName(documents.getCreatedBy().getName())
                .downloadTimes(documents.getDownloadTimes())
                .point(documents.getPoint())
                .createdAt(documents.getCreatedAt())
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

    private void uploadDocument(DocumentCreationRequest request){
        if(request.getPoint() == 0){
            accountService.rewardPoint(request.getCreatedBy().getId(), 20);
        }
        Documents documents = new Documents();
        documents.setName(request.getName());
        documents.setDescription(request.getDescription());
        documents.setType(request.getType());
        documents.setCategory(request.getCategory());
        documents.setCreatedBy(request.getCreatedBy());
        documents.setPoint(request.getPoint());
        documents.setUrl(request.getDocUrl());
        documents.setCreatedAt(LocalDateTime.now());
        documents.setAvatar(request.getAvatar());
        documents.setDownloadTimes(0);
        documentRepository.save(documents);
    }

    private String updateFile(MultipartFile file, Documents document) throws GeneralSecurityException, IOException {
        String url = document.getUrl();
        int index = url.indexOf("id=");
        String fieldId = url.substring(index + 3);

        driveService.deleteFileFromDrive(fieldId);

        String originalFileName = file.getOriginalFilename();
        if(originalFileName == null)
            throw new IllegalArgumentException("Original file name is null");

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

        return documents.stream()
                .filter(doc -> doc.getId().equals(docId))
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.DOC_NOT_EXIST));
    }

    private String getAccountIdFromContext(){
        var context = SecurityContextHolder.getContext();
        String email = context.getAuthentication().getName();
        Account account = accountRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return account.getId();
    }
}
