package com.example.webchiasetailieu.dto.request;

import com.example.webchiasetailieu.enums.NotificationType;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationCreationRequest {
    String title;
    String content;

    @NotBlank(message = "NOT_NULL")
    NotificationType type;

    @NotBlank(message = "NOT_NULL")
    String accountId;

    String docName;
    String accountName;

    String feedbackMessage;
    String feedbackDate;
}
