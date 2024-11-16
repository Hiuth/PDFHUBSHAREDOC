package com.example.webchiasetailieu.repository;

import com.example.webchiasetailieu.entity.Documents;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Documents, String> {
    boolean existsById(String id);
    @Query("SELECT c FROM Documents c WHERE c.category.id = :categoryId")
    List<Documents> findByCategoryId(String categoryId);
    List<Documents> findByCreatedBy_Id(String accountId);

    @Query("select c from Documents c where c.name Like %:KeyWord% OR c.createdBy.name Like %:KeyWord%")
    List<Documents> findDocumentsByKeyWord(String KeyWord);


    @Query("select c from Documents c where c.category.subCategory Like %:KeyWord%")
    List<Documents> findDocumentsBySubCategory(String KeyWord);
}
