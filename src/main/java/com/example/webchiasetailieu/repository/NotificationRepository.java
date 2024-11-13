package com.example.webchiasetailieu.repository;

import com.example.webchiasetailieu.entity.Notifications;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository  extends JpaRepository<Notifications, String> {
    boolean existsById(String id);
    boolean existsByTitle(String title);

    List<Notifications> findByAccount_Id(@NotBlank String account_Id);
}
