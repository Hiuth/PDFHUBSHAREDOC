package com.example.webchiasetailieu.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.w3c.dom.Document;

import java.time.LocalDateTime;

@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @ManyToOne
    @JoinColumn(name = "account_id", referencedColumnName = "id")
    Account account;

    @ManyToOne
    @JoinColumn(name = "doc_id", referencedColumnName = "id")
    Documents document;

    @Column(columnDefinition = "TEXT")
    String comText;

    LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
