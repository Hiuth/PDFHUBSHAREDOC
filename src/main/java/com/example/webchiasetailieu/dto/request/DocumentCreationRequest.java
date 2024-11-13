package com.example.webchiasetailieu.dto.request;

import com.example.webchiasetailieu.entity.Account;
import com.example.webchiasetailieu.entity.DocCategory;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DocumentCreationRequest {
    @NotBlank(message = "NOT_NULL")
    @Size(min = 5, message = "FILE_NAME_INVALID")
    String name;

    @NotBlank(message = "NOT_NULL")
    String description;

    @NotBlank(message = "NOT_NULL")
    String type;

    @NotBlank(message = "NOT_NULL")
    int point;
    String avatar;

    @NotBlank(message = "NOT_NULL")
    Account createdBy;
    String docUrl;

    @NotBlank(message = "NOT_NULL")
    DocCategory category;
}
