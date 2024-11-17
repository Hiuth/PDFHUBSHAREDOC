package com.example.webchiasetailieu.repository;

import com.example.webchiasetailieu.entity.DownloadHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DownloadHistoryRepository extends JpaRepository<DownloadHistory, String> {
    List<DownloadHistory> findByAccount_Id(String id);

    @Query("SELECT COUNT(dh) FROM DownloadHistory dh WHERE dh.downloadTime >= :startOfDay AND dh.downloadTime < :endOfDay")
    long countDownloadsToday(LocalDateTime startOfDay, LocalDateTime endOfDay);
}
