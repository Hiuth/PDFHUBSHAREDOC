package com.example.webchiasetailieu.controller;

import com.example.webchiasetailieu.dto.request.NotificationCreationRequest;
import com.example.webchiasetailieu.dto.response.ApiResponse;
import com.example.webchiasetailieu.dto.response.NotificationResponse;
import com.example.webchiasetailieu.entity.Notifications;
import com.example.webchiasetailieu.service.NotificationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/noti")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationController {
    NotificationService service;


    @PostMapping
    public ApiResponse<NotificationResponse> createNotification(NotificationCreationRequest request) {
        ApiResponse<NotificationResponse> response = new ApiResponse<>();
        response.setMessage("Create notification: ");
        response.setResult(service.notify(request));
        return response;
    }

    @GetMapping
    public ApiResponse<List<Notifications>> getAllNotifications() {
        return ApiResponse.<List<Notifications>>builder()
                .code(1000)
                .message("Get all notifications")
                .result(service.getAll())
                .build();
    }

    @GetMapping("/get/my-notification")
    @MessageMapping("/getMyNoti/{token}")
    @SendTo("/topic/getNotification/{token}")
    public ApiResponse<List<Notifications>> getMyNotification(@DestinationVariable String token) {
        ApiResponse<List<Notifications>> response = new ApiResponse<>();
        response.setMessage("Get all notification: ");
        response.setResult(service.getMyNotifications());
        return response;
    }

    @GetMapping("/{id}")
    public ApiResponse<NotificationResponse> getNotificationById(@PathVariable String id) {
        ApiResponse<NotificationResponse> response = new ApiResponse<>();
        response.setMessage("Get all notification: ");
        response.setResult(service.getById(id));
        return response;
    }

//    @GetMapping("/delete/{id}")
//    @MessageMapping("/deleteNoti/{id}")
//    @SendTo("/topic/deleteNotification")
//    public ApiResponse<String> deleteNotificationById(@DestinationVariable String id) {
//        ApiResponse<String> response = new ApiResponse<>();
//        response.setMessage("Get all notification: ");
//        response.setResult(service.delete(id));
//        return response;
//    }

    @MessageMapping("/deleteNoti/{id}")
    @SendTo("/topic/deleteNotification")
    ApiResponse<Boolean> deleteMyNotification(@DestinationVariable String id) {
        return ApiResponse.<Boolean>builder()
                .code(1000)
                .message("Delete my notification: ")
                .result(service.deleteMyNotification(id))
                .build();
    }
}
