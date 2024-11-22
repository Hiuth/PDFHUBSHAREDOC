package com.example.webchiasetailieu.dto.request;

import com.example.webchiasetailieu.enums.FeedbackType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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

    @NotNull(message = "NOT_NULL")
    FeedbackType type;

    @NotBlank(message = "NOT_NULL")
    String content;

    String docId;
}
