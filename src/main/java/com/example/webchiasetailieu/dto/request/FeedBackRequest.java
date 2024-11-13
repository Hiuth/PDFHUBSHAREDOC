package com.example.webchiasetailieu.dto.request;

import com.example.webchiasetailieu.entity.Account;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FeedBackRequest {
    @NotBlank(message = "NOT_NULL")
    String feedback;

    @NotBlank(message = "NOT_NULL")
    LocalDateTime date;
    String type;
    String status;
    String feedbackFromAdmin;
    String email;
    Account account;
}
