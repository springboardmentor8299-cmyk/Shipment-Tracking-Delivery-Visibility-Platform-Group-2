package com.shiptrack.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "proof_of_deliveries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProofOfDelivery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipment_id", nullable = false)
    private Shipment shipment;

    @Column(name = "recipient_name", length = 100)
    private String recipientName;

    @Column(name = "signature_data", columnDefinition = "TEXT")
    private String signatureData;

    @Column(name = "signature_hash", length = 64)
    private String signatureHash;

    @Column(name = "item_image_data", columnDefinition = "TEXT")
    private String itemImageData;

    @Column(name = "item_image_hash", length = 64)
    private String itemImageHash;

    @Column(name = "method", length = 30)
    @Builder.Default
    private String method = "DIGITAL";

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "captured_at")
    private LocalDateTime capturedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "captured_by")
    private User capturedBy;

    @Column(name = "verification_status", length = 30)
    @Builder.Default
    private String verificationStatus = "PENDING";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by")
    private User verifiedBy;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "verification_notes", columnDefinition = "TEXT")
    private String verificationNotes;
}
