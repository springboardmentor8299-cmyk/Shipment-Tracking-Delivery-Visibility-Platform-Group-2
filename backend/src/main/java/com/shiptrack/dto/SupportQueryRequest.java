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
public class SupportQueryRequest {

    @NotBlank
    private String subject;

    @NotBlank
    private String message;

    private String trackingNumber;
}