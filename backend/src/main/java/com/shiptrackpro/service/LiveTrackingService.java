package com.shiptrackpro.service;

import com.shiptrackpro.dto.ShipmentDTO;
import com.shiptrackpro.entity.Shipment;
import com.shiptrackpro.repository.ShipmentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Service
public class LiveTrackingService {

    private static final Logger logger = LoggerFactory.getLogger(LiveTrackingService.class);

    @Autowired(required = false)
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired(required = false)
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ShipmentRepository shipmentRepository;

    public void updateDriverTelemetry(String shipmentId, ShipmentDTO.TelemetryUpdateRequest telemetry) {
        // Cache to Redis with TTL
        if (redisTemplate != null) {
            try {
                String cacheKey = "tracking:telemetry:" + shipmentId;
                Map<String, Object> map = new HashMap<>();
                map.put("shipmentId", shipmentId);
                map.put("lat", telemetry.getLat());
                map.put("lng", telemetry.getLng());
                map.put("speedKmH", telemetry.getSpeedKmH());
                map.put("batteryPct", telemetry.getBatteryPct());
                map.put("city", telemetry.getCity());
                map.put("timestamp", System.currentTimeMillis());

                redisTemplate.opsForValue().set(cacheKey, map, Duration.ofMinutes(30));
            } catch (Exception e) {
                logger.warn("Redis caching bypassed for telemetry: {}", e.getMessage());
            }
        }

        // Broadcast to WebSocket topic: /topic/tracking/{shipmentId}
        if (messagingTemplate != null) {
            try {
                messagingTemplate.convertAndSend("/topic/tracking/" + shipmentId, telemetry);
                messagingTemplate.convertAndSend("/topic/tracking/live", telemetry);
            } catch (Exception e) {
                logger.warn("WebSocket telemetry broadcast error: {}", e.getMessage());
            }
        }
    }

    public Object getCachedTelemetry(String shipmentId) {
        if (redisTemplate != null) {
            try {
                return redisTemplate.opsForValue().get("tracking:telemetry:" + shipmentId);
            } catch (Exception e) {
                logger.warn("Redis get error: {}", e.getMessage());
            }
        }
        return null;
    }
}
