package com.shiptrack.backend.config;

import com.shiptrack.backend.entity.*;
import com.shiptrack.backend.repository.*;
import com.shiptrack.backend.service.GeocodingService;
import com.shiptrack.backend.service.RouteHistoryService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;
import java.util.Optional;

@Configuration
public class DataSeeder {

    @Bean
    public CommandLineRunner initDatabase(
            UserRepository userRepository,
            ShipmentRepository shipmentRepository,
            PodRecordRepository podRecordRepository,
            RouteHistoryRepository routeHistoryRepository,
            AnalyticsMetricRepository analyticsMetricRepository,
            GeocodingService geocodingService,
            RouteHistoryService routeHistoryService) {
        return args -> {
            System.out.println("========== [MILESTONE 3: DATA SEEDER INITIALIZATION & FULL ROLE SETUP] ==========");

            // 1. Seed / Fetch 5 Core Roles
            User admin = getOrCreateUser(userRepository, "admin", "admin@shiptrack.com", "admin123", "ADMINISTRATOR");
            User customer = getOrCreateUser(userRepository, "theerthana", "theerthana@gmail.com", "customer123", "CUSTOMER");
            User bizClient = getOrCreateUser(userRepository, "bizcorp", "biz@shiptrack.com", "biz123", "BUSINESS_CLIENT");
            User operator = getOrCreateUser(userRepository, "driver_sam", "sam@shiptrack.com", "driver123", "LOGISTICS_OPERATOR");
            User support = getOrCreateUser(userRepository, "support_amy", "amy@shiptrack.com", "support123", "SUPPORT_AGENT");

            // 2. Re-seed clean shipment dataset
            shipmentRepository.deleteAll();
            podRecordRepository.deleteAll();
            routeHistoryRepository.deleteAll();

            // Shipments
            Shipment s1 = createShipment(shipmentRepository, geocodingService, "SH1001", "Delhi Hub", customer.getUsername(), "Central Dispatch Warehouse, Delhi", "Koramangala, Bengaluru", "IN_TRANSIT", customer.getId(), admin.getId());
            Shipment s2 = createShipment(shipmentRepository, geocodingService, "SH1002", "Mumbai Dispatch", "Enterprise Client A", "Bandra Kurla Complex, Mumbai", "Anna Nagar, Chennai", "DELIVERED", customer.getId(), admin.getId());
            Shipment s3 = createShipment(shipmentRepository, geocodingService, "SH1003", "Pune Logistics", customer.getUsername(), "Hinjewadi IT Park, Pune", "Whitefield, Bengaluru", "IN_TRANSIT", customer.getId(), admin.getId());
            Shipment s4 = createShipment(shipmentRepository, geocodingService, "SH1004", "Hyderabad Fleet", customer.getUsername(), "Secunderabad Terminal, Hyderabad", "Hitech City, Hyderabad", "PENDING", customer.getId(), admin.getId());
            Shipment s5 = createShipment(shipmentRepository, geocodingService, "SH1005", "Chennai Port", customer.getUsername(), "Chennai Port Terminal, Chennai", "MG Road, Kochi", "DELIVERED", customer.getId(), admin.getId());
            Shipment s6 = createShipment(shipmentRepository, geocodingService, "YTG1986", "Central Dispatch", customer.getUsername(), "Central Dispatch Warehouse, Terminal 1, Delhi", "Kochi, Kerala", "IN_TRANSIT", customer.getId(), admin.getId());

            // 3. Seed Route History Waypoints
            seedRouteWaypoints(routeHistoryService, s1);
            seedRouteWaypoints(routeHistoryService, s2);
            seedRouteWaypoints(routeHistoryService, s6);

            // 4. Seed POD Records
            // Delivered POD
            PodRecord podDelivered = new PodRecord();
            podDelivered.setShipmentId(s2.getId());
            podDelivered.setRecipientName("Enterprise Client A");
            podDelivered.setDeliveryAgentId(operator.getId());
            podDelivered.setSignatureUrl("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='100'><path d='M10 80 Q 52 10 95 80 T 180 80' stroke='%231E293B' stroke-width='4' fill='none'/><text x='190' y='75' font-family='sans-serif' font-size='20' fill='%232563EB'>Delivered</text></svg>");
            podDelivered.setPhotoUrls("https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop");
            podDelivered.setGeoLat(s2.getDestLatitude());
            podDelivered.setGeoLng(s2.getDestLongitude());
            podDelivered.setCapturedAt(LocalDateTime.now().minusHours(2));
            podDelivered.setStatus("VERIFIED");
            podDelivered.setVerifiedBy("admin");
            podDelivered.setVerifiedAt(LocalDateTime.now().minusHours(1));
            podRecordRepository.save(podDelivered);

            // Disputed POD for Support Agent testing
            PodRecord podDisputed = new PodRecord();
            podDisputed.setShipmentId(s5.getId());
            podDisputed.setRecipientName("Unknown Receiver");
            podDisputed.setDeliveryAgentId(operator.getId());
            podDisputed.setSignatureUrl("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='100'><path d='M20 50 L100 50 L200 50' stroke='%23EF4444' stroke-width='4' fill='none'/><text x='210' y='55' font-family='sans-serif' font-size='18' fill='%23EF4444'>Disputed</text></svg>");
            podDisputed.setPhotoUrls("https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&auto=format&fit=crop");
            podDisputed.setGeoLat(s5.getDestLatitude());
            podDisputed.setGeoLng(s5.getDestLongitude());
            podDisputed.setCapturedAt(LocalDateTime.now().minusHours(5));
            podDisputed.setStatus("DISPUTED");
            podDisputed.setNotes("Recipient claims package box was damaged upon delivery.");
            podRecordRepository.save(podDisputed);

            System.out.println("========== [MILESTONE 3: SEEDING COMPLETE WITH 5 ROLES & POD RECORDS] ==========");
        };
    }

    private User getOrCreateUser(UserRepository userRepository, String username, String email, String password, String role) {
        Optional<User> byEmail = userRepository.findByEmail(email);
        if (byEmail.isPresent()) {
            User u = byEmail.get();
            u.setRole(role);
            return userRepository.save(u);
        }
        Optional<User> byUsername = userRepository.findByUsername(username);
        if (byUsername.isPresent()) {
            User u = byUsername.get();
            u.setRole(role);
            return userRepository.save(u);
        }
        User u = new User();
        u.setUsername(username);
        u.setEmail(email);
        u.setPassword(password);
        u.setRole(role);
        return userRepository.save(u);
    }

    private Shipment createShipment(ShipmentRepository repo, GeocodingService geocoder, String trackingNumber, String sender, String receiver, String pickupAddress, String deliveryAddress, String status, Long customerId, Long createdByUserId) {
        Shipment s = new Shipment();
        s.setTrackingNumber(trackingNumber);
        s.setSenderName(sender);
        s.setReceiverName(receiver);
        s.setPickupAddress(pickupAddress);
        s.setDeliveryAddress(deliveryAddress);
        s.setStatus(status);
        s.setCustomerId(customerId);
        s.setCreatedByUserId(createdByUserId);

        double[] pickupCoords = geocoder.geocodeAddress(pickupAddress);
        double[] destCoords = geocoder.geocodeAddress(deliveryAddress);

        s.setPickupLatitude(pickupCoords[0]);
        s.setPickupLongitude(pickupCoords[1]);
        s.setDestLatitude(destCoords[0]);
        s.setDestLongitude(destCoords[1]);

        double currentLat = pickupCoords[0] + (destCoords[0] - pickupCoords[0]) * 0.45;
        double currentLng = pickupCoords[1] + (destCoords[1] - pickupCoords[1]) * 0.45;
        s.setLatitude(currentLat);
        s.setLongitude(currentLng);

        return repo.save(s);
    }

    private void seedRouteWaypoints(RouteHistoryService routeHistoryService, Shipment shipment) {
        if (shipment == null) return;
        double pLat = shipment.getPickupLatitude() != null ? shipment.getPickupLatitude() : 28.6139;
        double pLng = shipment.getPickupLongitude() != null ? shipment.getPickupLongitude() : 77.2090;
        double dLat = shipment.getDestLatitude() != null ? shipment.getDestLatitude() : 12.9716;
        double dLng = shipment.getDestLongitude() != null ? shipment.getDestLongitude() : 77.5946;

        routeHistoryService.recordSnapshot(shipment.getId(), pLat, pLng, "PICKED_UP", "Origin Warehouse: " + shipment.getPickupAddress());
        routeHistoryService.recordSnapshot(shipment.getId(), pLat + (dLat - pLat) * 0.25, pLng + (dLng - pLng) * 0.25, "IN_TRANSIT", "Highway Toll Plaza Checkpoint");
        routeHistoryService.recordSnapshot(shipment.getId(), pLat + (dLat - pLat) * 0.50, pLng + (dLng - pLng) * 0.50, "IN_TRANSIT", "Regional Sorting Hub");
        routeHistoryService.recordSnapshot(shipment.getId(), pLat + (dLat - pLat) * 0.75, pLng + (dLng - pLng) * 0.75, "OUT_FOR_DELIVERY", "Local Dispatch Center");
    }
}
