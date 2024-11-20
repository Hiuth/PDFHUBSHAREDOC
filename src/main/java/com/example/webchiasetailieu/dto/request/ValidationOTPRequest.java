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
public class ValidationOTPRequest {
    @NotBlank(message = "NOT_NULL")
    @Size(min = 6, max = 6, message = "INCORRECT_OTP")
    String otp;

    @NotBlank(message = "NOT_NULL")
    String email;
}
