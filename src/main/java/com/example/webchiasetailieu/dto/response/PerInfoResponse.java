package com.example.webchiasetailieu.dto.response;

import com.example.webchiasetailieu.entity.Account;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PerInfoResponse {
    String fullName;
    Date birthday;
    String gender;
    String avatar;
    String email;
    String username;
    int points;
    String accountId;
    Account account;

//    public String getEmail() {
//        return account != null ? account.getEmail() : null;
//    }
}
