package com.shiptrack.repository;

import com.shiptrack.entity.Operator;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OperatorRepository extends JpaRepository<Operator, Long> {

    
    Optional<Operator> findByEmail(String email);

    
    Optional<Operator> findByLicenseNumber(String licenseNumber);

    
    boolean existsByEmail(String email);

    
    boolean existsByLicenseNumber(String licenseNumber);

    
    List<Operator> findByOperatorNameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrAssignedRegionContainingIgnoreCase(
            String operatorName,
            String email,
            String assignedRegion
    );

    
    long countByIsActiveTrue();

    
    long countByIsActiveFalse();
}