package com.example.webchiasetailieu.dto.request;

import com.example.webchiasetailieu.entity.Account;
import com.example.webchiasetailieu.enums.FeedbackType;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FeedBackRequest {
    @NotBlank(message = "NOT_NULL")
    String feedback;
    FeedbackType feedbackType;
    String status;
    String feedbackFromAdmin;
    String email;
    Account account;
    String otherId;
}
