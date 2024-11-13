package com.example.webchiasetailieu.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Date;

@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PersonalInformation {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    private String fullName;
    private Date birthday;
    private String gender;
    private String avatar;

    @OneToOne
    @JoinColumn(name = "account_id", referencedColumnName = "id")
    private Account account;
}
