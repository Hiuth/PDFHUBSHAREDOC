package com.example.webchiasetailieu.controller;

import com.example.webchiasetailieu.dto.request.UpdateDocumentRequest;
import com.example.webchiasetailieu.dto.response.*;
import com.example.webchiasetailieu.entity.DocCategory;
import com.example.webchiasetailieu.entity.Documents;
import com.example.webchiasetailieu.entity.DownloadHistory;
import com.example.webchiasetailieu.service.DocumentService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.List;

@RestController
@RequestMapping("/doc")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DocumentController {
    DocumentService documentService;

    @PostMapping("/upload")
    public ApiResponse<DriveResponse> handleFileUpload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("docName") String docName,
            @RequestParam("docType") String docType,
            @RequestParam("description") String description,
            @RequestParam("docCategoryId") String docCategoryId,
            @RequestParam("point") int point,
            @RequestParam("avatar") String avatar)
            throws IOException {
        return ApiResponse.<DriveResponse>builder()
                .result(documentService.uploadFile(file,docName,docType,description,
                         docCategoryId,point,avatar))
                .build();
    }

    @GetMapping("/get-my-doc")
    public ApiResponse<List<Documents>> getMyDoc(){
        return ApiResponse.<List<Documents>>builder()
                .code(1000)
                .message("Get my documents:")
                .result(documentService.getMyDocuments())
                .build();
    }

    @GetMapping("/download/{docId}")
    @MessageMapping("/downloadFile/{docId}")
    @SendTo("/topic/downFile")
    public ApiResponse<String> handleFileDownload(@PathVariable String docId){
        return ApiResponse.<String>builder()
                .message("Download file:")
                .result(documentService.download(docId))
                .build();
    }

    @GetMapping("/my-download-history")
    public ApiResponse<List<DownloadHistory>> getMyDownloadHistory(){
        return ApiResponse.<List<DownloadHistory>>builder()
                .message("My download history:")
                .result(documentService.getMyDownloadHistory())
                .build();
    }

    @GetMapping("/get-all")
    @MessageMapping("allDocuments")
    @SendTo("/topic/Documents")
    ApiResponse<List<Documents>> getAllDocuments(){
        return ApiResponse.<List<Documents>>builder()
                .message("List of documents:")
                .result(documentService.getAll())
                .build();
    }


    @GetMapping("/find/{keyword}")
    @MessageMapping("/findDoc/{keyword}")
    @SendTo("/topic/findDocument")
    ApiResponse<List<Documents>> findDocumentsByKeyWord(@DestinationVariable String keyword){ //chuyển về @PathVariable nếu muốn xài trên post man
        return ApiResponse.<List<Documents>>builder()
                .message("List of documents:")
                .result(documentService.findDocumentByKeyword(keyword))
                .build();
    }

    @PostMapping("/getByCategory")
    ApiResponse<List<Documents>> getByCategory(@RequestBody DocCategory docCategory){
        return ApiResponse.<List<Documents>>builder()
                .code(1000)
                .message("List of documents:")
                .result(documentService.getAllByCategory(docCategory))
                .build();
    }

    @GetMapping("/get-id/{id}")
    ApiResponse<DocumentResponse> getDocumentById(@PathVariable String id){
        return ApiResponse.<DocumentResponse>builder()
                .message("Find document by id:")
                .result(documentService.getById(id))
                .build();
    }

    @PutMapping("{id}")
    @MessageMapping("/updateDocument/{id}")
    @SendTo("/topic/updateDoc")
    ApiResponse<DocumentResponse> updateDocument(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file,
            @RequestParam("docName") String docName,
            @RequestParam("docType") String docType,
            @RequestParam("description") String description,
            @RequestParam("docCategoryId") String docCategoryId,
            @RequestParam("avatar") String avatar)
            throws IOException, GeneralSecurityException {
        return ApiResponse.<DocumentResponse>builder()
                .code(1000)
                .message("Update document:")
                .result(documentService.updateDocument(id, UpdateDocumentRequest.builder()
                                .avatar(avatar)
                                .type(docType)
                                .categoryId(docCategoryId)
                                .description(description)
                                .name(docName)
                                .file(file)
                        .build()))
                .build();
    }

    @DeleteMapping("/{id}")
    @MessageMapping("/deleteDoc/{id}")
    @SendTo("/topic/deleteDocument")
    ApiResponse<String> deleteDocument(@DestinationVariable String id) throws GeneralSecurityException, IOException {
        return ApiResponse.<String>builder()
                .message("Delete document")
                .result(documentService.delete(id))
                .build();
    }

    @DeleteMapping
    ApiResponse<String> deleteAllDocuments(){
        return ApiResponse.<String>builder()
                .message("Delete all documents:")
                .result(documentService.deleteAll())
                .build();
    }
}
