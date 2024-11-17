package com.example.webchiasetailieu.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationCreationRequest {
    @NotBlank
    @Size(min = 5, message = "NOTI_LENGTH")
    String title;

    @NotBlank
    @Size(min = 5, message = "NOTI_LENGTH")
    String content;

    @NotBlank
    String type;
    String account;
}
