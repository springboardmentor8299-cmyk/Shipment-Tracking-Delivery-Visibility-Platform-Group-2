package com.shiptrack.repository;

import com.shiptrack.entity.SupportQuery;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SupportQueryRepository extends JpaRepository<SupportQuery, Long> {

    List<SupportQuery> findAllByOrderByCreatedAtDesc();

    List<SupportQuery> findByStatusOrderByCreatedAtDesc(String status);

    List<SupportQuery> findByCreatedByIdOrderByCreatedAtDesc(Long userId);
}