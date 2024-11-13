package com.example.webchiasetailieu.repository;

import com.example.webchiasetailieu.entity.DocCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocCategoryRepository extends JpaRepository<DocCategory, String> {
    boolean existsById(String id);
    boolean existsByMainCategory(String mainCategory);
    boolean existsBySubCategory(String subCategory);
    List<DocCategory> findByMainCategory(String mainCategory);
    List<DocCategory> findBySubCategory(String subCategory);
}
