package com.example.webchiasetailieu.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.web.multipart.MultipartFile;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateDocumentRequest {
    MultipartFile file;
    String name;
    String description;
    String type;
    String avatar;
    String categoryId;
}
