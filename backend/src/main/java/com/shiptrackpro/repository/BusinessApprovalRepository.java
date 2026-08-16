package com.shiptrackpro.repository;

import com.shiptrackpro.entity.BusinessApproval;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BusinessApprovalRepository extends JpaRepository<BusinessApproval, String> {
    List<BusinessApproval> findByStatus(String status);
}
