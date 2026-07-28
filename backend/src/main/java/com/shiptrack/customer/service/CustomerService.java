package com.shiptrack.customer.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.shiptrack.admin.shipment.entity.Shipment;
import com.shiptrack.admin.shipment.entity.ShipmentStatus;
import com.shiptrack.admin.shipment.repository.ShipmentRepository;
import com.shiptrack.auth.entity.User;
import com.shiptrack.auth.repository.UserRepository;
import com.shiptrack.customer.dto.CustomerDashboardResponse;
import com.shiptrack.customer.dto.CustomerProfileResponse;
import com.shiptrack.customer.dto.CustomerShipmentResponse;
import com.shiptrack.customer.dto.ShipmentTrackingResponse;

@Service
public class CustomerService {

    private final ShipmentRepository shipmentRepository;
    private final UserRepository userRepository;

    public CustomerService(ShipmentRepository shipmentRepository,
                           UserRepository userRepository) {
        this.shipmentRepository = shipmentRepository;
        this.userRepository = userRepository;
    }

    // ================= Dashboard =================

    public CustomerDashboardResponse getDashboard(String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        List<Shipment> shipments = shipmentRepository.findByCustomerId(user);

        int total = shipments.size();

        int active = (int) shipments.stream()
                .filter(s -> s.getStatus() == ShipmentStatus.IN_TRANSIT)
                .count();

        int delivered = (int) shipments.stream()
                .filter(s -> s.getStatus() == ShipmentStatus.DELIVERED)
                .count();

        // FIXED: Changed ShipmentStatus.PENDING -> ShipmentStatus.CREATED
        int pending = (int) shipments.stream()
                .filter(s -> s.getStatus() == ShipmentStatus.CREATED)
                .count();

        return new CustomerDashboardResponse(
                user.getUsername(),
                total,
                active,
                delivered,
                pending
        );
    }

    // ================= My Shipments =================

    public List<CustomerShipmentResponse> getMyShipments(String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // FIXED: Passes all 11 arguments required by CustomerShipmentResponse
        return shipmentRepository.findByCustomerId(user)
        .stream()
        .map(shipment -> new CustomerShipmentResponse(
                shipment.getTrackingId(),
                shipment.getCustomerName(),
                shipment.getReceiverName(), // or shipment.getReceiver()
                shipment.getNoOfItems(),                          // Default value if Shipment entity lacks item count
                shipment.getTotalWeightOfItems(),
                shipment.getShipmentCost(),
                shipment.getOrigin(),
                shipment.getDestination(),
                shipment.getStatus(),
                shipment.getShipmentDate(),
                shipment.getDeliveryDate()
        ))
        .collect(Collectors.toList());
    }

    // ================= Tracking =================

    public ShipmentTrackingResponse getTracking(String username, String trackingId) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Shipment shipment = shipmentRepository.findByTrackingId(trackingId)
                .orElseThrow(() -> new RuntimeException("Shipment not found"));

        // Security Check: Customer can only view their own shipment
        if (!shipment.getCustomerId().getId().equals(user.getId())) {
            throw new RuntimeException("Access Denied");
        }

        return new ShipmentTrackingResponse(
                shipment.getTrackingId(),
                user.getUsername(),
                shipment.getOrigin(),
                shipment.getDestination(),
                shipment.getStatus(),
                shipment.getShipmentDate(),
                shipment.getDeliveryDate()
        );
    }

    // ================= Profile =================

    public CustomerProfileResponse getProfile(String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return new CustomerProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getRole().name().replace("_", " ")
        );
    }
}