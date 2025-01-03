package com.example.webchiasetailieu.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AccountCreationRequest {
    @NotBlank(message = "NOT_NULL")
    @Size(min = 5, message = "NAME_INVALID")
    String name;

    @NotBlank(message = "NOT_NULL")
    @Size(min = 6, message = "PASSWORD_INVALID")
    String password;

    @NotBlank(message = "NOT_NULL")
    @Email(message = "EMAIL_INVALID")
    String email;
}
