package com.example.webchiasetailieu.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FeedBackResponse {
    String feedback;
    LocalDateTime date;
    String type;
    String status;
    String feedbackFromAdmin;
    String email;
}
