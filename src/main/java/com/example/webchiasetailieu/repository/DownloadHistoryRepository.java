package com.example.webchiasetailieu.repository;

import com.example.webchiasetailieu.entity.DownloadHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DownloadHistoryRepository extends JpaRepository<DownloadHistory, String> {
}
