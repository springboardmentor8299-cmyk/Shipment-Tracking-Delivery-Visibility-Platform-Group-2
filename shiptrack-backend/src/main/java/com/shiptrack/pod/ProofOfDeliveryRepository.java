package com.shiptrack.pod;

import com.shiptrack.shipment.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProofOfDeliveryRepository
        extends JpaRepository<ProofOfDelivery, Long> {

    Optional<ProofOfDelivery> findByShipment(
            Shipment shipment
    );

    boolean existsByShipment(
            Shipment shipment
    );

    List<ProofOfDelivery> findByVerificationStatus(
            VerificationStatus verificationStatus
    );
}