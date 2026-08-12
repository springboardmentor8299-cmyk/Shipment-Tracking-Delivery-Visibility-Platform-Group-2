package com.shiptrack.repository;

import com.shiptrack.entity.ShipmentRequest;
import com.shiptrack.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ShipmentRequestRepository extends JpaRepository<ShipmentRequest, Long> {

    List<ShipmentRequest> findByUserOrderByCreatedAtDesc(User user);
}
