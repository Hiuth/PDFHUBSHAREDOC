package com.example.webchiasetailieu.controller;

import com.example.webchiasetailieu.dto.request.FeedBackRequest;
import com.example.webchiasetailieu.dto.response.ApiResponse;
import com.example.webchiasetailieu.dto.response.FeedBackResponse;
import com.example.webchiasetailieu.entity.Feedbacks;
import com.example.webchiasetailieu.service.FeedBackService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/feedback")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FeedBackController {
    FeedBackService service;

    @PostMapping
    public ApiResponse<FeedBackResponse> createFeedback(FeedBackRequest request) {
        ApiResponse<FeedBackResponse> response = new ApiResponse<>();
        response.setMessage("Create feedback: ");
        response.setResult(service.createFeedback(request));
        return response;
    }

    @GetMapping
    public ApiResponse<List<Feedbacks>> getAllFeedbacks() {
        ApiResponse<List<Feedbacks>> response = new ApiResponse<>();
        response.setMessage("Get all feedbacks: ");
        response.setResult(service.getAll());
        return response;
    }

    @GetMapping("/{id}")
    public ApiResponse<FeedBackResponse> getFeedbackById(@PathVariable String id) {
        ApiResponse<FeedBackResponse> response = new ApiResponse<>();
        response.setMessage("Get feedback: ");
        response.setResult(service.getById(id));
        return response;
    }

    @GetMapping("/my-feedback")
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
}
