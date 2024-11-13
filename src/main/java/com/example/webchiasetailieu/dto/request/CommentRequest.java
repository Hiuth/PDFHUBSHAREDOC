package com.example.webchiasetailieu.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CommentRequest {
    @NotBlank(message = "NOT_NULL")
    String document;

    @NotBlank(message = "NOT_NULL")
    String comText;

    @NotBlank(message = "NOT_NULL")
    LocalDateTime createdAt;

    @NotBlank(message = "NOT_NULL")
    String account;
}
