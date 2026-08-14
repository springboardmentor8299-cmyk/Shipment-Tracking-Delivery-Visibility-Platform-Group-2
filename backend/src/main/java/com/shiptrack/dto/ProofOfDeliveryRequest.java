package com.shiptrack.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProofOfDeliveryRequest {

    @NotBlank(message = "Recipient name is required.")
    private String recipientName;

    @NotBlank(message = "Signature data is required.")
    private String signatureData;

    @NotBlank(message = "Item image data is required.")
    private String itemImageData;

    private String method;

    private String notes;
}
