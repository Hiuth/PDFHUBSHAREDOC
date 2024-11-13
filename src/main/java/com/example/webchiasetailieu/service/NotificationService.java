package com.example.webchiasetailieu.service;

import com.example.webchiasetailieu.dto.request.NotificationCreationRequest;
import com.example.webchiasetailieu.dto.response.NotificationResponse;
import com.example.webchiasetailieu.entity.Account;
import com.example.webchiasetailieu.entity.Notifications;
import com.example.webchiasetailieu.exception.AppException;
import com.example.webchiasetailieu.exception.ErrorCode;
import com.example.webchiasetailieu.repository.AccountRepository;
import com.example.webchiasetailieu.repository.NotificationRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationService {
    NotificationRepository repository;
    AccountRepository accountRepository;

    public NotificationResponse createNotification(NotificationCreationRequest request) {
        Account account = accountRepository.findById(request.getAccount())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        Notifications notification = Notifications.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .type(request.getType())
                .account(account)
                .build();
        return convertToResponse(repository.save(notification));
    }

    //public
    public List<Notifications> getMyNotifications() {
        var context = SecurityContextHolder.getContext();
        String email = context.getAuthentication().getName();
        Account account = accountRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        List<Notifications> notifications = repository.findByAccount_Id(account.getId());
        if (notifications.isEmpty())
            throw new AppException(ErrorCode.LIST_EMPTY);
        return notifications;
    }

    public List<Notifications> getAll() {
        if(repository.findAll().isEmpty())
            throw new AppException(ErrorCode.LIST_EMPTY);
        return repository.findAll();
    }

    public NotificationResponse getById(String id) {
        return convertToResponse(repository.findById(id).orElseThrow(
                () -> new AppException(ErrorCode.NOTI_NOT_EXISTED)));
    }

    public String delete(String id) {
        repository.deleteById(id);
        return "Delete successfully";
    }

    public void downloadDocument() {
        createNotification(NotificationCreationRequest.builder()
                .title("TÀI LIỆU BẠN ĐĂNG ĐÃ CÓ 1 LƯỢT MUA!")
                .content("TÀI LIỆU ... BẠN ĐĂNG ĐÃ CÓ 1 MUA MỚI! CHÚC MỪNG BẠN!!!!")
                .type("Thông báo")
                .account(getUserFromContext().getId())
                .build());
    }

    public void downloadSuccess() {
        createNotification(NotificationCreationRequest.builder()
                .title("THÔNG BÁO MUA BÀI THÀNH CÔNG!")
                .content("MUA BÀI THÀNH CÔNG!")
                .type("Thông báo")
                .account(getUserFromContext().getId())
                .build());
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

    private Account getUserFromContext(){
        var context = SecurityContextHolder.getContext();
        String email = context.getAuthentication().getName();
        return accountRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }
}
