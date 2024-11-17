package com.example.webchiasetailieu.dto.request;


import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdatePerInfoRequest {
    @Size(min = 5, message = "NAME_INVALID")
    String fullName;

    @Past(message = "BIRTHDAY_INVALID")
    Date birthday;

    @Pattern(regexp = "Male|Female", message = "GENDER_INVALID")
    String gender;
}
