package com.example.webchiasetailieu.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DocCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    String mainCategory;
    String subCategory;
}
