package com.shiptrackpro.dto;

import java.util.List;
import java.util.Map;

public class AiDTO {

    public static class PredictEtaRequest {
        private String origin;
        private String destination;
        private Double currentLat;
        private Double currentLng;
        private Double speedKmH;
        private String weatherCondition;
        private String trafficLevel;
        private String priority;

        public String getOrigin() { return origin; }
        public void setOrigin(String origin) { this.origin = origin; }

        public String getDestination() { return destination; }
        public void setDestination(String destination) { this.destination = destination; }

        public Double getCurrentLat() { return currentLat; }
        public void setCurrentLat(Double currentLat) { this.currentLat = currentLat; }

        public Double getCurrentLng() { return currentLng; }
        public void setCurrentLng(Double currentLng) { this.currentLng = currentLng; }

        public Double getSpeedKmH() { return speedKmH; }
        public void setSpeedKmH(Double speedKmH) { this.speedKmH = speedKmH; }

        public String getWeatherCondition() { return weatherCondition; }
        public void setWeatherCondition(String weatherCondition) { this.weatherCondition = weatherCondition; }

        public String getTrafficLevel() { return trafficLevel; }
        public void setTrafficLevel(String trafficLevel) { this.trafficLevel = trafficLevel; }

        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
    }

    public static class PredictEtaResponse {
        private String estimatedEta;
        private String delayRisk; // Low, Medium, High
        private Integer confidenceScorePct;
        private String aiReasoning;
        private List<String> alternativeRoutes;

        public PredictEtaResponse() {}

        public PredictEtaResponse(String estimatedEta, String delayRisk, Integer confidenceScorePct, String aiReasoning, List<String> alternativeRoutes) {
            this.estimatedEta = estimatedEta;
            this.delayRisk = delayRisk;
            this.confidenceScorePct = confidenceScorePct;
            this.aiReasoning = aiReasoning;
            this.alternativeRoutes = alternativeRoutes;
        }

        public String getEstimatedEta() { return estimatedEta; }
        public void setEstimatedEta(String estimatedEta) { this.estimatedEta = estimatedEta; }

        public String getDelayRisk() { return delayRisk; }
        public void setDelayRisk(String delayRisk) { this.delayRisk = delayRisk; }

        public Integer getConfidenceScorePct() { return confidenceScorePct; }
        public void setConfidenceScorePct(Integer confidenceScorePct) { this.confidenceScorePct = confidenceScorePct; }

        public String getAiReasoning() { return aiReasoning; }
        public void setAiReasoning(String aiReasoning) { this.aiReasoning = aiReasoning; }

        public List<String> getAlternativeRoutes() { return alternativeRoutes; }
        public void setAlternativeRoutes(List<String> alternativeRoutes) { this.alternativeRoutes = alternativeRoutes; }
    }

    public static class AssistantRequest {
        private String prompt;
        private String userRole;
        private List<Map<String, Object>> shipments;

        public String getPrompt() { return prompt; }
        public void setPrompt(String prompt) { this.prompt = prompt; }

        public String getUserRole() { return userRole; }
        public void setUserRole(String userRole) { this.userRole = userRole; }

        public List<Map<String, Object>> getShipments() { return shipments; }
        public void setShipments(List<Map<String, Object>> shipments) { this.shipments = shipments; }
    }

    public static class AssistantResponse {
        private String reply;

        public AssistantResponse() {}
        public AssistantResponse(String reply) { this.reply = reply; }

        public String getReply() { return reply; }
        public void setReply(String reply) { this.reply = reply; }
    }
}
