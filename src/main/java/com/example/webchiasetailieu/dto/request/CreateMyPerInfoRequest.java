package com.example.webchiasetailieu.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateMyPerInfoRequest {
    @Size(min = 5, message = "NAME_INVALID")
    @NotBlank(message = "NOT_NULL")
    String fullName;

    @Past(message = "BIRTHDAY_INVALID")
    @NotBlank(message = "NOT_NULL")
    Date birthday;

    @Pattern(regexp = "Male|Female", message = "GENDER_INVALID")
    @NotBlank(message = "NOT_NULL")
    String gender;
}

