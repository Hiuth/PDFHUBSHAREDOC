package com.example.webchiasetailieu.dto.request;

import com.example.webchiasetailieu.enums.EmailType;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SendEmailRequest {
    String email;
    EmailType emailType;
    String subject;
    String body;

    //Download
    String createBy;
    String docName;
}
