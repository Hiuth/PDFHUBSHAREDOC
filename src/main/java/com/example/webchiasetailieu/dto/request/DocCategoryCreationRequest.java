package com.example.webchiasetailieu.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DocCategoryCreationRequest {
    @NotBlank(message = "NOT_NULL")
    @Size(min = 3, message = "CATEGORY_FOLDER_INVALID")
    String main;

    @Size(min = 3, message = "CATEGORY_FOLDER_INVALID")
    String sub;
}
