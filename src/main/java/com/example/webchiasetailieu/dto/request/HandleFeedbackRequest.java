package com.example.webchiasetailieu.dto.request;

import com.example.webchiasetailieu.enums.FeedbackType;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HandleFeedbackRequest {
    @NotBlank(message = "NOT_NULL")
    String id;

    @NotBlank(message = "NOT_NULL")
    FeedbackType type;

    @NotBlank(message = "NOT_NULL")
    String content;

    String docId;
}
