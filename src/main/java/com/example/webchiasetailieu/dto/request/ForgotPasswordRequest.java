package com.example.webchiasetailieu.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ForgotPasswordRequest {
    @NotBlank(message = "NOT_NULL")
    String email;

    @NotBlank(message = "NOT_NULL")
    String newPass;
}
