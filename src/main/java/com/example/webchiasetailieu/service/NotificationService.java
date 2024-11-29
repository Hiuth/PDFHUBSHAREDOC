package com.example.webchiasetailieu.service;

import com.example.webchiasetailieu.dto.request.NotificationCreationRequest;
import com.example.webchiasetailieu.dto.response.NotificationResponse;
import com.example.webchiasetailieu.entity.Account;
import com.example.webchiasetailieu.entity.Notifications;
import com.example.webchiasetailieu.enums.NotificationType;
import com.example.webchiasetailieu.exception.AppException;
import com.example.webchiasetailieu.exception.ErrorCode;
import com.example.webchiasetailieu.repository.AccountRepository;
import com.example.webchiasetailieu.repository.NotificationRepository;
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
public class NotificationService {
    NotificationRepository repository;
    AccountRepository accountRepository;

    public NotificationResponse notify(NotificationCreationRequest request){
        Account account = accountRepository.findById(request.getAccountId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        switch (request.getType()) {
            case REGISTER:
                request.setTitle(NotificationType.REGISTER.getTitle());
                request.setContent(NotificationType.REGISTER.getDescription());
                break;

            case UPLOAD:
                request.setTitle(NotificationType.UPLOAD.getTitle());
                request.setContent(NotificationType.UPLOAD.getDescription());
                break;

            case DOWNLOAD:
                request.setTitle(NotificationType.DOWNLOAD.getTitle());
                request.setContent(NotificationType.DOWNLOAD.getDescription());
                break;

            case COMMENT:
                request.setTitle(NotificationType.COMMENT.getTitle());
                request.setContent(NotificationType.COMMENT.getDescription());
                break;

            case POST_VIOLATION:
                request.setTitle(NotificationType.POST_VIOLATION.getTitle());
                request.setContent(String.format(NotificationType.POST_VIOLATION.getDescription(),
                        request.getDocName()));
                break;

            case ACCOUNT_LOCKED:
                request.setTitle(NotificationType.ACCOUNT_LOCKED.getTitle());
                request.setContent(NotificationType.ACCOUNT_LOCKED.getDescription());
                break;

            case COMMENT_VIOLATION:
                request.setTitle(NotificationType.COMMENT_VIOLATION.getTitle());
                request.setContent(String.format(NotificationType.COMMENT_VIOLATION.getDescription(), "Tên bài viết"));
                break;

            case RECEIVE_POINTS:
                request.setTitle(NotificationType.RECEIVE_POINTS.getTitle());
                request.setContent(String.format(NotificationType.RECEIVE_POINTS.getDescription(), 20));
                break;

            case COMMENT_ACCOUNT_LOCKED:
                request.setTitle(NotificationType.COMMENT_ACCOUNT_LOCKED.getTitle());
                request.setContent(NotificationType.COMMENT_ACCOUNT_LOCKED.getDescription());
                break;

            case COMMENT_WARNING:
                request.setTitle(NotificationType.COMMENT_WARNING.getTitle());
                request.setContent(NotificationType.COMMENT_WARNING.getDescription());
                break;

            case FEEDBACK:
                request.setTitle(NotificationType.FEEDBACK.getTitle());
                request.setContent(NotificationType.FEEDBACK.getDescription());
                break;

            case ADMIN_FEEDBACK:
                request.setTitle(NotificationType.ADMIN_FEEDBACK.getTitle());
                request.setContent(String.format(NotificationType.ADMIN_FEEDBACK.getDescription(),
                        request.getFeedbackMessage(), request.getFeedbackDate()));
                break;

            default:
                throw new IllegalArgumentException("Loại thông báo không hợp lệ: " + request.getType());
        }

        Notifications notification = Notifications.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .type(request.getType().toString())
                .account(account)
                .build();
        return convertToResponse(repository.save(notification));
    }

    //public
    public List<Notifications> getMyNotifications() {
        Account account = getAccountFromAuthentication();
        List<Notifications> notifications = repository.findByAccount_Id(account.getId());
        if (notifications.isEmpty())
            throw new AppException(ErrorCode.LIST_EMPTY);
        return notifications;
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<Notifications> getAll() {
        if(repository.findAll().isEmpty())
            throw new AppException(ErrorCode.LIST_EMPTY);
        return repository.findAll();
    }

    @PreAuthorize("hasRole('ADMIN')")
    public NotificationResponse getById(String id) {
        return convertToResponse(repository.findById(id).orElseThrow(
                () -> new AppException(ErrorCode.NOTIFICATION_NOT_EXISTED)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public String delete(String id) {
        repository.deleteById(id);
        return "Delete successfully";
    }

    private NotificationResponse convertToResponse(Notifications notification) {
        return NotificationResponse.builder()
                .title(notification.getTitle())
                .content(notification.getContent())
                .dateTime(notification.getDateTime())
                .type(notification.getType())
                .email(notification.getAccount().getEmail())
                .build();
    }

    private Account getAccountFromAuthentication() {
        return accountRepository.findByEmail(SecurityContextHolder.getContext().getAuthentication().getName())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }

}
