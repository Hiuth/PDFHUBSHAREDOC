package com.example.webchiasetailieu.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DownloadHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    int point;
    LocalDateTime downloadTime;

    @ManyToOne
    @JoinColumn(name = "account_id", referencedColumnName = "id")
    Account account;

    @ManyToOne
    @JoinColumn(name = "document_id", referencedColumnName = "id")
    Documents document;

    @PrePersist
    protected void onCreate() {
        downloadTime = LocalDateTime.now();
    }
}
