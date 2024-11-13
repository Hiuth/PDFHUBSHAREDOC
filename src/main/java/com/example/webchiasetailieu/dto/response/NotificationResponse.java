package com.example.webchiasetailieu.dto.response;

import com.example.webchiasetailieu.entity.Account;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class NotificationResponse {
    String title;
    String content;
    LocalDateTime dateTime;
    String type;
    String email;
}
