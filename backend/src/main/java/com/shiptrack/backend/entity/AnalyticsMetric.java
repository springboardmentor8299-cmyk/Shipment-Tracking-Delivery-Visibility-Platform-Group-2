package com.shiptrack.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "analytics_metrics")
public class AnalyticsMetric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String metricKey;

    private Double metricValue;

    private String metricGroup; // CUSTOMER, BUSINESS, OPERATOR, SUPPORT, ADMIN

    private Long targetEntityId; // userId, businessId, operatorId, etc.

    private LocalDateTime calculatedAt;

    @Column(columnDefinition = "TEXT")
    private String metadataJson;

    public AnalyticsMetric() {
    }

    public AnalyticsMetric(String metricKey, Double metricValue, String metricGroup, Long targetEntityId, LocalDateTime calculatedAt, String metadataJson) {
        this.metricKey = metricKey;
        this.metricValue = metricValue;
        this.metricGroup = metricGroup;
        this.targetEntityId = targetEntityId;
        this.calculatedAt = calculatedAt;
        this.metadataJson = metadataJson;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMetricKey() {
        return metricKey;
    }

    public void setMetricKey(String metricKey) {
        this.metricKey = metricKey;
    }

    public Double getMetricValue() {
        return metricValue;
    }

    public void setMetricValue(Double metricValue) {
        this.metricValue = metricValue;
    }

    public String getMetricGroup() {
        return metricGroup;
    }

    public void setMetricGroup(String metricGroup) {
        this.metricGroup = metricGroup;
    }

    public Long getTargetEntityId() {
        return targetEntityId;
    }

    public void setTargetEntityId(Long targetEntityId) {
        this.targetEntityId = targetEntityId;
    }

    public LocalDateTime getCalculatedAt() {
        return calculatedAt;
    }

    public void setCalculatedAt(LocalDateTime calculatedAt) {
        this.calculatedAt = calculatedAt;
    }

    public String getMetadataJson() {
        return metadataJson;
    }

    public void setMetadataJson(String metadataJson) {
        this.metadataJson = metadataJson;
    }
}
