package com.example.webchiasetailieu.repository;

import com.example.webchiasetailieu.entity.Feedbacks;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedBackRepository extends JpaRepository<Feedbacks, String> {
    boolean existsById(String id);
    List<Feedbacks> findAllByAccount_Id(String accountId);
}
