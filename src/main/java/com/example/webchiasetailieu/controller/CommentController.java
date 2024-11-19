package com.example.webchiasetailieu.controller;

import com.example.webchiasetailieu.dto.request.CommentRequest;
import com.example.webchiasetailieu.dto.response.ApiResponse;
import com.example.webchiasetailieu.entity.Comment;
import com.example.webchiasetailieu.service.CommentService;
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
@RequestMapping("/comment")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CommentController {
    CommentService service;

    @MessageMapping("/createComment")
    @SendTo("/topic/comments")
    public ApiResponse<CommentRequest> createComment(@Valid @RequestBody CommentRequest commentRequest) {
        return ApiResponse.<CommentRequest>builder()
                .message("Comment created successfully.")
                .result(service.addComment(commentRequest))
                .build();
    }


//    @GetMapping
//    ApiResponse<List<Comment>> getAllComments() {
//        return ApiResponse.<List<Comment>>builder()
//                .message("Comment created")
//                .result(service.getAll())
//                .build();
//    }
//
//    @GetMapping("/{id}")
//    ApiResponse<CommentRequest> getCommentById(@PathVariable String id) {
//        return ApiResponse.<CommentRequest>builder()
//                .message("Comment created")
//                .result(service.getById(id))
//                .build();
//    }

    @MessageMapping("/comments/{docId}")
    @SendTo("/topic/getComments")
    ApiResponse<List<Comment>> getAllCommentsByDocId(@DestinationVariable String docId) {
        return ApiResponse.<List<Comment>>builder()
                .message("Comment fetched successfully")
                .result(service.getAllCommentsOfDocument(docId))
                .build();
    }

//    @PutMapping("/{id}")
    @MessageMapping("/updateComment/{id}")
    @SendTo("/topic/commentUpdate")
    ApiResponse<CommentRequest> updateComment(@DestinationVariable String id ,@RequestBody CommentRequest commentRequest) {
        return ApiResponse.<CommentRequest>builder()
                .message("Comment created")
                .result(service.updateComment(id, commentRequest))
                .build();
    }

//    @DeleteMapping("/{id}")
    @MessageMapping("/deleteComment/{id}")
    @SendTo("/topic/commentDelete")
    ApiResponse<String> deleteComment(@DestinationVariable String id) {
        return ApiResponse.<String>builder()
                .message("Comment deleted")
                .result(service.deleteComment(id))
                .build();
    }
}
