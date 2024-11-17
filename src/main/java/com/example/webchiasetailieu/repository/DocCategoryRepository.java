package com.example.webchiasetailieu.repository;

import com.example.webchiasetailieu.entity.Account;
import com.example.webchiasetailieu.entity.DocCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocCategoryRepository extends JpaRepository<DocCategory, String> {
    boolean existsById(String id);
    boolean existsByMainCategory(String mainCategory);
    boolean existsBySubCategory(String subCategory);
    List<DocCategory> findByMainCategory(String mainCategory);
    List<DocCategory> findBySubCategory(String subCategory);
}
