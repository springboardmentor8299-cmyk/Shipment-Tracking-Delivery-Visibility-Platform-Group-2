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
public class ProofOfDeliveryVerifyRequest {

    @NotBlank(message = "Decision is required (VERIFIED or REJECTED).")
    private String decision;

    private String notes;
}
