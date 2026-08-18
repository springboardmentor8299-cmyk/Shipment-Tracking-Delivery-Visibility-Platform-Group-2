package com.shiptrack.backend.repository;

import com.shiptrack.backend.entity.SupportIssue;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SupportIssueRepository extends JpaRepository<SupportIssue, Long> {
    List<SupportIssue> findAllByOrderByIdDesc();
    List<SupportIssue> findByCustomerEmailIgnoreCaseOrderByIdDesc(String customerEmail);
    List<SupportIssue> findByStatusIgnoreCase(String status);
}
