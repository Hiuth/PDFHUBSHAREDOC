package com.example.webchiasetailieu.controller;

import com.example.webchiasetailieu.dto.request.FeedBackRequest;
import com.example.webchiasetailieu.dto.request.HandleFeedbackRequest;
import com.example.webchiasetailieu.dto.request.UpdateFeedbackRequest;
import com.example.webchiasetailieu.dto.response.ApiResponse;
import com.example.webchiasetailieu.dto.response.FeedBackResponse;
import com.example.webchiasetailieu.dto.response.NotificationResponse;
import com.example.webchiasetailieu.entity.Feedbacks;
import com.example.webchiasetailieu.service.FeedBackService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/feedback")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FeedBackController {
    FeedBackService service;

    @PostMapping
    @MessageMapping("/createFeedback")
    @SendTo("/topic/feedbacks")
    public ApiResponse<FeedBackResponse> createFeedback(@RequestBody @Valid FeedBackRequest request) {
        ApiResponse<FeedBackResponse> response = new ApiResponse<>();
        response.setMessage("Create feedback: ");
        response.setResult(service.createFeedback(request));
        return response;
    }

    @PutMapping
    @MessageMapping("/adminUpdateFeed")
    @SendTo("/topic/adminUpdateFeedBack")
    public ApiResponse<FeedBackResponse> updateFeedback(@RequestBody @Valid UpdateFeedbackRequest request) {
        ApiResponse<FeedBackResponse> response = new ApiResponse<>();
        response.setMessage("Create feedback: ");
        response.setResult(service.updateStatusFeedbackOrResponseFromAdmin(request));
        return response;
    }

    @GetMapping("/all")
    @MessageMapping("/allFeed")
    @SendTo("/topic/allFeedBack")
    public ApiResponse<List<Feedbacks>> getAllFeedbacks() {
        ApiResponse<List<Feedbacks>> response = new ApiResponse<>();
        response.setMessage("Get all feedbacks: ");
        response.setResult(service.getAll());
        return response;
    }

    @GetMapping("/{id}")
    @MessageMapping("/getFeedbackbyId/{id}")
    @SendTo("/topic/getFeedbackbyId")
    public ApiResponse<FeedBackResponse> getFeedbackById(@DestinationVariable String id) {
        ApiResponse<FeedBackResponse> response = new ApiResponse<>();
        response.setMessage("Get feedback: ");
        response.setResult(service.getById(id));
        return response;
    }

    @GetMapping("/my-feedback")
    @MessageMapping("/myFeedback")
    @SendTo("/topic/myFeedBack")
    public ApiResponse<List<Feedbacks>> getMyFeedback() {
        ApiResponse<List<Feedbacks>> response = new ApiResponse<>();
        response.setMessage("My feedbacks: ");
        response.setResult(service.getMyFeedbacks());
        return response;
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteFeedback(@PathVariable String id) {
        return ApiResponse.<String>builder()
                .code(1000)
                .message("Delete feedback: " + id)
                .result(service.deleteById(id))
                .build();
    }

    @PostMapping("/send-notification")
    @MessageMapping("/adminSendNoti")
    @SendTo("/topic/adminSendNotification")
    public ApiResponse<NotificationResponse> sendNotification(@RequestBody @Valid HandleFeedbackRequest request) {
        return ApiResponse.<NotificationResponse>builder()
                .code(1000)
                .message("Send notification to user who uploaded violating document:")
                .result(service.violationNotification(request))
                .build();
    }
}
