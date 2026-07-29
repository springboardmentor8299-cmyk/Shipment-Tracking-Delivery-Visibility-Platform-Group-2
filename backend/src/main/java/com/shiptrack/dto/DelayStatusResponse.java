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
public class DelayStatusResponse {
    private Long id;
    private Integer delayMinutes;
    private String delayReason;
    private Double probability;
    private LocalDateTime detectedAt;
    private Boolean hasDelay;
}
