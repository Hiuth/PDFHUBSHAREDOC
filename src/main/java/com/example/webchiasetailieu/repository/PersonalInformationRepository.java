package com.example.webchiasetailieu.repository;

import com.example.webchiasetailieu.entity.Comment;
import com.example.webchiasetailieu.entity.PersonalInformation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface PersonalInformationRepository extends JpaRepository<PersonalInformation, String> {
    boolean existsById(String id);
//    PersonalInformation findByAccountId(String id);

    @Query("SELECT c FROM PersonalInformation c WHERE c.account.id = :accountId")
    PersonalInformation findByAccountId(String accountId);

//    @Query("SELECT c FROM PersonalInformation c WHERE c.account.id = :accountId")
//    List<PersonalInformation> findByAccountId(String accountId);
}
