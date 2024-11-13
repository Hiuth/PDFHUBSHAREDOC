package com.example.webchiasetailieu.dto.response;

import com.example.webchiasetailieu.entity.Account;
import com.example.webchiasetailieu.entity.DocCategory;
import com.fasterxml.jackson.annotation.JsonInclude;
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
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DocumentResponse {
    String name;
    String email;
    String description;
    String type;
    int point;
    LocalDateTime createdAt;
    String avatar;
    int downloadTimes;
    DocCategory category;
}
