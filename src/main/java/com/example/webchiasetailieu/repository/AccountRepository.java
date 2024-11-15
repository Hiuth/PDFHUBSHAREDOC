package com.example.webchiasetailieu.repository;

import com.example.webchiasetailieu.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, String> {
    boolean existsByEmail(String email);
//    boolean existsByUsername(String username);
    boolean existsByName(String name);
    Optional<Account> findByEmail(String email);

    @Query("select c from Account c where c.name Like %:KeyWord% or c.email Like %:KeyWord%")
    List<Account> findAccountByKeyWord(String KeyWord);
}
