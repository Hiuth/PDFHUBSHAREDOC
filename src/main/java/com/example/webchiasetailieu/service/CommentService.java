package com.example.webchiasetailieu.service;

import com.example.webchiasetailieu.dto.request.CommentRequest;
import com.example.webchiasetailieu.dto.request.NotificationCreationRequest;
import com.example.webchiasetailieu.dto.response.ApiResponse;
import com.example.webchiasetailieu.dto.response.NotificationResponse;
import com.example.webchiasetailieu.entity.Account;
import com.example.webchiasetailieu.entity.Comment;
import com.example.webchiasetailieu.entity.Documents;
import com.example.webchiasetailieu.entity.PersonalInformation;
import com.example.webchiasetailieu.enums.NotificationType;
import com.example.webchiasetailieu.exception.AppException;
import com.example.webchiasetailieu.exception.ErrorCode;
import com.example.webchiasetailieu.repository.AccountRepository;
import com.example.webchiasetailieu.repository.CommentRepository;
import com.example.webchiasetailieu.repository.DocumentRepository;
import com.example.webchiasetailieu.repository.PersonalInformationRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CommentService {
    CommentRepository repository;
    AccountRepository accountRepository;
    DocumentRepository documentRepository;
    NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;
    private final PersonalInformationRepository personalInformationRepository;
    private final CommentRepository commentRepository;

    @PreAuthorize("hasAuthority('COMMENT')")
    public CommentRequest addComment(CommentRequest commentRequest) {
        Account account = getAccountFromAuthentication();

        Documents documents = documentRepository.findById(commentRequest.getDocument())
                .orElseThrow(() -> new AppException(ErrorCode.DOC_NOT_EXIST));

        NotificationResponse notification = notificationService.notify(
                NotificationCreationRequest.builder()
                        .type(NotificationType.COMMENT)
                        .accountId(documents.getCreatedBy().getId())
                        .build());

        // Gửi thông báo đến client qua WebSocket
        messagingTemplate.convertAndSend("/topic/getNotification",
                ApiResponse.<NotificationResponse>builder()
                        .result(notification)
                        .message("Thông báo mới")
                        .build());

        return convertToResponse(repository.save(Comment.builder()
                        .account(account)
                        .comText(commentRequest.getComText())
                        .document(documents)
                .build()));
    }

    public String getCommentAvatar(String id){
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COMMENT_NOT_EXIST));
        PersonalInformation personalInformation = personalInformationRepository
                .findByAccountId(comment.getAccount().getId());
        return personalInformation.getAvatar();
    }

    @PreAuthorize("hasAuthority('EDIT_COMMENT')")
    public CommentRequest updateComment(String id, CommentRequest request) {
        Comment comment = repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.COMMENT_NOT_EXIST));
        if(request.getComText() != null)
            comment.setComText(request.getComText());
        return convertToResponse(repository.save(comment));
    }

    //public
    public List<Comment> getAllCommentsOfDocument(String documentId) {
        if(!documentRepository.existsById(documentId))
            throw new AppException(ErrorCode.DOC_NOT_EXIST);
        return repository.findByDocId(documentId);
    }

    @PreAuthorize("hasAuthority('DELETE_COMMENT')")
    public String deleteComment(String id) {
        if(!repository.existsById(id))
            throw new AppException(ErrorCode.DOC_NOT_EXIST);
        repository.deleteById(id);
        if(repository.existsById(id))
            return "Failed to delete comment";
        else return "Successfully deleted comment";
    }

    private CommentRequest convertToResponse(Comment comment) {
        return CommentRequest.builder()
                .document(comment.getDocument().getId())
                .account(comment.getAccount().getId())
                .createdAt(comment.getCreatedAt())
                .comText(comment.getComText())
                .build();
    }

    private Account getAccountFromAuthentication() {
        return accountRepository.findByEmail(
                        SecurityContextHolder.getContext().getAuthentication().getName())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }


}
