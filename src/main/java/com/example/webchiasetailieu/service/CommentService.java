package com.example.webchiasetailieu.service;

import com.example.webchiasetailieu.dto.request.CommentRequest;
import com.example.webchiasetailieu.entity.Account;
import com.example.webchiasetailieu.entity.Comment;
import com.example.webchiasetailieu.entity.Documents;
import com.example.webchiasetailieu.exception.AppException;
import com.example.webchiasetailieu.exception.ErrorCode;
import com.example.webchiasetailieu.repository.AccountRepository;
import com.example.webchiasetailieu.repository.CommentRepository;
import com.example.webchiasetailieu.repository.DocumentRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
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

//    public List<Comment> getAll(){
//        return repository.findAll();
//    }
//
//    public CommentRequest getById(String id){
//        return convertToResponse(repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.COMMENT_NOT_EXIST)));
//    }

    @PreAuthorize("hasAuthority('COMMENT')")
    public CommentRequest addComment(CommentRequest commentRequest) {
        Account account = accountRepository.findById(commentRequest.getAccount())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Documents documents = documentRepository.findById(commentRequest.getDocument())
                .orElseThrow(() -> new AppException(ErrorCode.DOC_NOT_EXIST));

        return convertToResponse(repository.save(Comment.builder()
                        .account(account)
                        .comText(commentRequest.getComText())
                        .createdAt(commentRequest.getCreatedAt())
                        .document(documents)
                .build()));
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
}
