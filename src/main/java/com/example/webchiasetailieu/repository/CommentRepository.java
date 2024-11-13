package com.example.webchiasetailieu.repository;

import com.example.webchiasetailieu.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, String> {
    @Query("SELECT c FROM Comment c WHERE c.document.id = :docId")
    List<Comment> findByDocId(String docId);

    List<Comment> findByAccount_Id(String accountId);
}
