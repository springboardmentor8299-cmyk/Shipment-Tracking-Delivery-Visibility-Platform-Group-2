package com.shiptrackpro.service;

import com.shiptrackpro.entity.*;
import com.shiptrackpro.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class DataInitializationService implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializationService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ShipmentRepository shipmentRepository;

    @Autowired
    private ShipmentEventRepository eventRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserActivityLogRepository activityLogRepository;

    @Autowired
    private EscalationRepository escalationRepository;

    @Autowired
    private BusinessApprovalRepository businessApprovalRepository;

    @Autowired
    private PlatformSettingRepository platformSettingRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            logger.info("Database already seeded with demo data.");
            return;
        }

        logger.info("Seeding database with ShipTrack Pro demo dataset...");

        // 1. Seed Users
        User customer = new User("usr-1", "Aarav Sharma", "aarav.sharma@tata.com", passwordEncoder.encode("password123"), Role.CUSTOMER);
        customer.setAvatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150");
        customer.setLastLogin("2026-07-26 08:30");

        User business = new User("usr-2", "Priya Patel", "priya.p@reliance.com", passwordEncoder.encode("password123"), Role.BUSINESS_CLIENT);
        business.setCompanyName("Reliance Supply Chain Solutions");
        business.setAvatarUrl("https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150");
        business.setLastLogin("2026-07-26 09:12");

        User operator = new User("usr-3", "Rajesh Verma", "rajesh.v@mahindra.com", passwordEncoder.encode("password123"), Role.LOGISTICS_OPERATOR);
        operator.setAvatarUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150");
        operator.setLastLogin("2026-07-26 07:45");

        User agent = new User("usr-4", "Ananya Iyer", "ananya.i@shiptrack.in", passwordEncoder.encode("password123"), Role.SUPPORT_AGENT);
        agent.setAvatarUrl("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150");
        agent.setLastLogin("2026-07-26 09:00");

        User admin = new User("usr-5", "Rajesh Admin", "admin@shiptrack.in", passwordEncoder.encode("admin123"), Role.ADMINISTRATOR);
        admin.setAvatarUrl("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150");
        admin.setLastLogin("2026-07-26 10:00");

        userRepository.saveAll(Arrays.asList(customer, business, operator, agent, admin));

        // 2. Seed Shipments
        Shipment s1 = new Shipment();
        s1.setId("ship-101");
        s1.setTrackingNumber("STP-9482-IN");
        s1.setSenderName("Tata Electronics Hub");
        s1.setSenderAddress(new LocationPoint("Mumbai", "MH", "India", 19.0760, 72.8777, "Bhiwandi Logistics Park, Thane"));
        s1.setReceiverName("Infosys Campus Depot");
        s1.setReceiverAddress(new LocationPoint("Bengaluru", "KA", "India", 12.9716, 77.5946, "Electronic City Phase 1, Hosur Road"));
        s1.setStatus(ShipmentStatus.OUT_FOR_DELIVERY);
        s1.setPriority(PriorityLevel.EXPRESS);
        s1.setWeightKg(4.8);
        s1.setPackageType("Rigid Parcel Box");
        s1.setDeclaredValueUsd(1450.0);
        s1.setCreatedAt("2026-07-24 14:00");
        s1.setEstimatedDeliveryTime("2026-07-26 16:30");
        s1.setAiPredictedDelayRisk("Low");
        s1.setAiDelayReason("Clear traffic on Mumbai-Pune Expressway & NH-48. Optimal route conditions.");
        s1.setCurrentLocation(new LocationPoint("Satara", "MH", "India", 17.6805, 74.0183, "Satara Highway Corridor"));

        Driver d1 = new Driver("usr-3", "Rajesh Verma", "+91 98765 43210", "Mahindra Furio Cargo Truck (#402)", "MH-12-TR-8821");
        d1.setCurrentLat(17.6805);
        d1.setCurrentLng(74.0183);
        d1.setSpeedKmH(68.0);
        d1.setBatteryPct(91);
        d1.setLastSignalTime("Just now");
        s1.setDriver(d1);
        s1.setDispatchStatus(DispatchStatus.ACCEPTED);
        s1.setAssignedOperatorId("usr-3");
        s1.setAssignedOperatorName("Rajesh Verma");

        Shipment s2 = new Shipment();
        s2.setId("ship-102");
        s2.setTrackingNumber("STP-8829-IN");
        s2.setSenderName("Reliance Supply Chain Solutions");
        s2.setSenderAddress(new LocationPoint("Delhi", "DL", "India", 28.7041, 77.1025, "Okhla Industrial Area Phase 3"));
        s2.setReceiverName("Dr. Reddy Laboratories");
        s2.setReceiverAddress(new LocationPoint("Hyderabad", "TS", "India", 17.3850, 78.4867, "Genome Valley, Shamirpet"));
        s2.setStatus(ShipmentStatus.IN_TRANSIT);
        s2.setPriority(PriorityLevel.OVERNIGHT);
        s2.setWeightKg(12.5);
        s2.setPackageType("Cold-Chain Insulated Container");
        s2.setDeclaredValueUsd(4200.0);
        s2.setCreatedAt("2026-07-25 09:30");
        s2.setEstimatedDeliveryTime("2026-07-27 11:00");
        s2.setAiPredictedDelayRisk("Medium");
        s2.setAiDelayReason("Monsoon heavy showers detected on NH-44 near Nagpur. Driver rerouted via outer ring road.");
        s2.setCurrentLocation(new LocationPoint("Nagpur", "MH", "India", 21.1458, 79.0882, "Nagpur Bypass Toll Plaza"));

        Driver d2 = new Driver("drv-02", "Suresh Nair", "+91 98111 22334", "Tata Ultra T.11 Refrigerated Van", "DL-01-AX-9912");
        d2.setCurrentLat(21.1458);
        d2.setCurrentLng(79.0882);
        d2.setSpeedKmH(58.0);
        d2.setBatteryPct(74);
        d2.setLastSignalTime("1 min ago");
        s2.setDriver(d2);
        s2.setDispatchStatus(DispatchStatus.ACCEPTED);

        Shipment s3 = new Shipment();
        s3.setId("ship-103");
        s3.setTrackingNumber("STP-3104-IN");
        s3.setSenderName("Apollo Pharma Logistics");
        s3.setSenderAddress(new LocationPoint("Ahmedabad", "GJ", "India", 23.0225, 72.5714, "Sanand GIDC Industrial Estate"));
        s3.setReceiverName("Manipal Hospital Pharmacy");
        s3.setReceiverAddress(new LocationPoint("Pune", "MH", "India", 18.5204, 73.8567, "Old Airport Road, Viman Nagar"));
        s3.setStatus(ShipmentStatus.DELIVERED);
        s3.setPriority(PriorityLevel.STANDARD);
        s3.setWeightKg(2.1);
        s3.setPackageType("Tamper-Evident Medical Box");
        s3.setDeclaredValueUsd(680.0);
        s3.setCreatedAt("2026-07-23 11:15");
        s3.setEstimatedDeliveryTime("2026-07-25 15:00");
        s3.setAiPredictedDelayRisk("Low");
        s3.setCurrentLocation(new LocationPoint("Pune", "MH", "India", 18.5204, 73.8567, "Pune Central Delivery Depot"));

        ProofOfDelivery pod3 = new ProofOfDelivery();
        pod3.setRecipientName("Sunita Reddy");
        pod3.setSigneeName("Sunita Reddy (Pharmacist)");
        pod3.setDeliveredAt("2026-07-25 14:48");
        pod3.setVerificationCode("8942");
        pod3.setVerificationStatus("VERIFIED");
        pod3.setSignatureImageUrl("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400");
        pod3.setDeliveryPhotoUrl("https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=400");
        s3.setProofOfDelivery(pod3);

        shipmentRepository.saveAll(Arrays.asList(s1, s2, s3));

        // 3. Seed Events
        eventRepository.save(new ShipmentEvent("evt-1", "ship-101", ShipmentStatus.CREATED, "2026-07-24 14:00", "Mumbai", "Order created and manifest registered.", "System"));
        eventRepository.save(new ShipmentEvent("evt-2", "ship-101", ShipmentStatus.PICKED_UP, "2026-07-24 16:30", "Bhiwandi Hub", "Package collected by carrier vehicle.", "Rajesh Verma"));
        eventRepository.save(new ShipmentEvent("evt-3", "ship-101", ShipmentStatus.IN_TRANSIT, "2026-07-25 08:00", "Pune Hub", "Departed Pune sorting facility toward Bengaluru corridor.", "Rajesh Verma"));
        eventRepository.save(new ShipmentEvent("evt-4", "ship-101", ShipmentStatus.OUT_FOR_DELIVERY, "2026-07-26 09:15", "Satara Highway", "Dispatched for final-mile delivery terminal.", "Rajesh Verma"));

        // 4. Seed Platform Settings & Escalations
        platformSettingRepository.save(new PlatformSetting());

        Escalation esc1 = new Escalation();
        esc1.setId("esc-101");
        esc1.setShipmentId("ship-101");
        esc1.setTrackingNumber("STP-9482-IN");
        esc1.setCustomerName("Aarav Sharma");
        esc1.setBusinessClient("Tata Electronics Hub");
        esc1.setOperatorName("Rajesh Verma");
        esc1.setSupportAgentName("Ananya Iyer");
        esc1.setIssueType("Flagged POD / Recipient Dispute");
        esc1.setPriority("High");
        esc1.setComplaintDetails("Customer claims parcel was left with security guard without OTP verification.");
        esc1.setAgentDecision("Flagged for Admin review. Recommending driver interview.");
        esc1.setEscalationDate("2026-07-26 14:45");
        esc1.setStatus("Open");
        escalationRepository.save(esc1);

        logger.info("Demo data seed complete.");
    }
}
