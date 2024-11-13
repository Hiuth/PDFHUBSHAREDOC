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
public class Notifications {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    String title;
    String content;
    LocalDateTime dateTime;
    String type;

    @ManyToOne
    @JoinColumn(name = "account_id", referencedColumnName = "id")
    Account account;

    @PrePersist
    protected void onCreate() {
        dateTime = LocalDateTime.now();
    }
}
