package com.example.webchiasetailieu.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EmailSendRequest {
    @Email(message = "EMAIL_INVALID")
    @NotBlank(message = "NOT_NULL")
    String email;
}
