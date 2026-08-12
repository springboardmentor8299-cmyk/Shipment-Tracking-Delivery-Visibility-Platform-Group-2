package com.shiptrack.repository;

import com.shiptrack.entity.Business;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BusinessRepository extends JpaRepository<Business, Long> {

    


    Optional<Business> findByEmail(String email);

    


    boolean existsByEmail(String email);

    


    List<Business> findByBusinessNameContainingIgnoreCase(String businessName);

    


    List<Business> findByOwnerNameContainingIgnoreCase(String ownerName);

    List<Business> findByBusinessNameContainingIgnoreCaseOrOwnerNameContainingIgnoreCase(
            String businessName,
            String ownerName
    );

    


    List<Business> findByIsActive(Boolean isActive);

    




    


    long countByIsActive(Boolean isActive);
}