package com.example.webchiasetailieu.dto.response;

import com.example.webchiasetailieu.entity.DocCategory;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DocumentResponse {
    String name;
    String accountName;
    String description;
    String type;
    int point;
    LocalDateTime createdAt;
    String avatar;
    int downloadTimes;
    DocCategory category;
}
