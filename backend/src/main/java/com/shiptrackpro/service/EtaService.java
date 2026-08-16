package com.shiptrackpro.service;

import com.shiptrackpro.dto.AiDTO;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class EtaService {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    public AiDTO.PredictEtaResponse calculateDynamicEta(AiDTO.PredictEtaRequest request) {
        double speed = request.getSpeedKmH() != null && request.getSpeedKmH() > 10 ? request.getSpeedKmH() : 60.0;
        
        // Base route calculation
        String traffic = request.getTrafficLevel() != null ? request.getTrafficLevel() : "Moderate";
        String weather = request.getWeatherCondition() != null ? request.getWeatherCondition() : "Clear";
        
        double trafficMultiplier = 1.0;
        String delayRisk = "Low";
        int confidence = 92;

        if ("Heavy".equalsIgnoreCase(traffic) || "Severe Congestion".equalsIgnoreCase(traffic)) {
            trafficMultiplier += 0.45;
            delayRisk = "High";
            confidence = 84;
        } else if ("Moderate".equalsIgnoreCase(traffic)) {
            trafficMultiplier += 0.15;
            delayRisk = "Medium";
            confidence = 89;
        }

        if ("Rain".equalsIgnoreCase(weather) || "Storm".equalsIgnoreCase(weather)) {
            trafficMultiplier += 0.25;
            if (!"High".equals(delayRisk)) delayRisk = "Medium";
        }

        // Estimate transit hours (default 5.5 hours adjusted by multiplier)
        double estimatedHours = 5.5 * trafficMultiplier;
        LocalDateTime etaTime = LocalDateTime.now().plusMinutes((long) (estimatedHours * 60));

        List<String> alternativeRoutes = new ArrayList<>();
        alternativeRoutes.add("Primary Expressway Route (via Toll Plaza 4)");
        alternativeRoutes.add("Alternative Bypass Bypass-NH48 (12 km longer, -25 min traffic delay)");

        String reasoning = String.format("Dynamic route analysis calculated %s delay risk under %s traffic and %s conditions with average speed %.1f km/h.",
                delayRisk, traffic, weather, speed);

        return new AiDTO.PredictEtaResponse(
                etaTime.format(FORMATTER),
                delayRisk,
                confidence,
                reasoning,
                alternativeRoutes
        );
    }
}
