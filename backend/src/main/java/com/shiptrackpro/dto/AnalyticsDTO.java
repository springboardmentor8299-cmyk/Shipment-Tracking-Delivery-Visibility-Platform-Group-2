package com.shiptrackpro.dto;

import java.util.List;
import java.util.Map;

public class AnalyticsDTO {

    public static class SummaryResponse {
        private Long totalShipments;
        private Long inTransitCount;
        private Long deliveredCount;
        private Long delayedCount;
        private Double onTimeDeliveryRatePct;
        private Double avgDeliveryHours;
        private List<Map<String, Object>> statusDistribution;
        private List<Map<String, Object>> carrierSla;
        private List<Map<String, Object>> delayCauses;

        public Long getTotalShipments() { return totalShipments; }
        public void setTotalShipments(Long totalShipments) { this.totalShipments = totalShipments; }

        public Long getInTransitCount() { return inTransitCount; }
        public void setInTransitCount(Long inTransitCount) { this.inTransitCount = inTransitCount; }

        public Long getDeliveredCount() { return deliveredCount; }
        public void setDeliveredCount(Long deliveredCount) { this.deliveredCount = deliveredCount; }

        public Long getDelayedCount() { return delayedCount; }
        public void setDelayedCount(Long delayedCount) { this.delayedCount = delayedCount; }

        public Double getOnTimeDeliveryRatePct() { return onTimeDeliveryRatePct; }
        public void setOnTimeDeliveryRatePct(Double onTimeDeliveryRatePct) { this.onTimeDeliveryRatePct = onTimeDeliveryRatePct; }

        public Double getAvgDeliveryHours() { return avgDeliveryHours; }
        public void setAvgDeliveryHours(Double avgDeliveryHours) { this.avgDeliveryHours = avgDeliveryHours; }

        public List<Map<String, Object>> getStatusDistribution() { return statusDistribution; }
        public void setStatusDistribution(List<Map<String, Object>> statusDistribution) { this.statusDistribution = statusDistribution; }

        public List<Map<String, Object>> getCarrierSla() { return carrierSla; }
        public void setCarrierSla(List<Map<String, Object>> carrierSla) { this.carrierSla = carrierSla; }

        public List<Map<String, Object>> getDelayCauses() { return delayCauses; }
        public void setDelayCauses(List<Map<String, Object>> delayCauses) { this.delayCauses = delayCauses; }
    }
}
