package com.example.webchiasetailieu.entity;

import jakarta.persistence.*;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    String name;
    String password;
    String email;
    int points;
    boolean isBanned;
    LocalDateTime banUntil;

    @ManyToMany
    Set<Role> roles;
}
