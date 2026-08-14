package com.shiptrack.repository;

import com.shiptrack.entity.SupportMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SupportMessageRepository extends JpaRepository<SupportMessage, Long> {

    List<SupportMessage> findByQueryIdOrderBySentAtAsc(Long queryId);
}
