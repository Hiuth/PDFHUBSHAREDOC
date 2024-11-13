package com.example.webchiasetailieu.repository;

import com.example.webchiasetailieu.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, String> {
    boolean existsByEmail(String email);
//    boolean existsByUsername(String username);
    boolean existsByName(String name);
    Optional<Account> findByEmail(String email);
}
