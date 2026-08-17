package com.shiptrackpro.repository;

import com.shiptrackpro.entity.Escalation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EscalationRepository extends JpaRepository<Escalation, String> {
    List<Escalation> findByStatus(String status);
}
