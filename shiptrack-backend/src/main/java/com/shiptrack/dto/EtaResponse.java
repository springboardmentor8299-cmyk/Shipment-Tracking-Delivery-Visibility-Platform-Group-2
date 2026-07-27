package com.shiptrack.dto;

import java.time.LocalDateTime;

public class EtaResponse {

    private Double remainingDistanceKm;
    private LocalDateTime estimatedDeliveryTime;
    private Integer predictedDelayMinutes;
    private Boolean delayed;
    private String delayReason;

    public EtaResponse() {
    }

    public Double getRemainingDistanceKm() {
        return remainingDistanceKm;
    }

    public void setRemainingDistanceKm(Double remainingDistanceKm) {
        this.remainingDistanceKm = remainingDistanceKm;
    }

    public LocalDateTime getEstimatedDeliveryTime() {
        return estimatedDeliveryTime;
    }

    public void setEstimatedDeliveryTime(
            LocalDateTime estimatedDeliveryTime
    ) {
        this.estimatedDeliveryTime = estimatedDeliveryTime;
    }

    public Integer getPredictedDelayMinutes() {
        return predictedDelayMinutes;
    }

    public void setPredictedDelayMinutes(
            Integer predictedDelayMinutes
    ) {
        this.predictedDelayMinutes = predictedDelayMinutes;
    }

    public Boolean getDelayed() {
        return delayed;
    }

    public void setDelayed(Boolean delayed) {
        this.delayed = delayed;
    }

    public String getDelayReason() {
        return delayReason;
    }

    public void setDelayReason(String delayReason) {
        this.delayReason = delayReason;
    }
}