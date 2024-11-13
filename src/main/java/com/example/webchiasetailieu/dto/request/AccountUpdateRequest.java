package com.example.webchiasetailieu.dto.request;


import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AccountUpdateRequest {
    @Size(min = 5, message = "NAME_INVALID")
    String name;
    Integer points;
    String password;
    List<String> roles;
}
