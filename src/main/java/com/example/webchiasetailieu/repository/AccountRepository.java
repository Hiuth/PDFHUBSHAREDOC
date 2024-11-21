package com.example.webchiasetailieu.repository;

import com.example.webchiasetailieu.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, String> {
    boolean existsByEmail(String email);
    boolean existsByName(String name);
    Optional<Account> findByEmail(String email);

    @Query("select c from Account c where c.name Like %:keyWord% or c.email Like %:keyWord%")
    List<Account> findAccountByKeyWord(String keyWord);

    long count();

    @Query("SELECT a FROM Account a WHERE a.registerDate >= :startOfWeek AND a.registerDate < :endOfWeek")
    List<Account> findAllByWeek(LocalDate startOfWeek, LocalDate endOfWeek);

    @Query("SELECT a FROM Account a " +
            "WHERE MONTH(a.registerDate) = :currentMonth AND YEAR(a.registerDate) = :currentYear")
    List<Account> findAllByMonthAndYear(int currentMonth, int currentYear);

    @Query("SELECT a FROM Account a WHERE FUNCTION('YEAR', a.registerDate) = :year")
    List<Account> findAllByYear(int year);
}
