package com.shiptrack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProofOfDeliveryResponse {
    private Long id;
    private Long shipmentId;
    private String trackingNumber;
    private String recipientName;
    private String signatureData;
    private String signatureHash;
    private String itemImageData;
    private String itemImageHash;
    private String method;
    private String notes;
    private LocalDateTime capturedAt;
    private String capturedByName;
    private String verificationStatus;
    private String verifiedByName;
    private LocalDateTime verifiedAt;
    private String verificationNotes;
    private LocalDateTime deliveredAt;
    private Boolean signatureIntact;
    private Boolean itemImageIntact;
}
