package com.example.webchiasetailieu.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Documents {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    String name;

    @Column(columnDefinition = "TEXT")
    String description;
    String type;
    String url;
    int point;
    LocalDateTime createdAt;
    String avatar;
    int downloadTimes;

    @ManyToOne
    @JoinColumn(name = "account_id", referencedColumnName = "id")
    Account createdBy;

    @ManyToOne
    @JoinColumn(name = "docategory_id", referencedColumnName = "id")
    DocCategory category;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
