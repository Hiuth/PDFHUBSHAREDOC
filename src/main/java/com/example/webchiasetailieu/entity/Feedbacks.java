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
public class Feedbacks {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(columnDefinition = "TEXT")
    String feedback;
    LocalDateTime date;
    String type;
    String status;
    String feedbackFromAdmin;

    @ManyToOne
    @JoinColumn(name = "accoutn_id", referencedColumnName = "id")
    Account account;

    @PrePersist
    protected void onCreate() {
        date = LocalDateTime.now();
    }
}
