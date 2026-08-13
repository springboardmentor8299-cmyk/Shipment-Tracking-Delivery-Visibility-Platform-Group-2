package com.shiptrack.customer.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.shiptrack.admin.pod.dto.PodResponse;
import com.shiptrack.admin.pod.service.PodService;
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
        private final PodService podService;

        public CustomerService(ShipmentRepository shipmentRepository,
                        UserRepository userRepository,
                        PodService podService) {
                this.shipmentRepository = shipmentRepository;
                this.userRepository = userRepository;
                this.podService = podService;
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
                                pending);
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
                                                shipment.getNoOfItems(), // Default value if Shipment entity lacks item
                                                                         // count
                                                shipment.getTotalWeightOfItems(),
                                                shipment.getShipmentCost(),
                                                shipment.getOrigin(),
                                                shipment.getDestination(),
                                                shipment.getStatus(),
                                                shipment.getShipmentDate(),
                                                shipment.getDeliveryDate()))
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
                                shipment.getDeliveryDate(),
                                shipment.getCurrentLocationName(),
                                shipment.getLastLocationUpdate(),
                                shipment.getEstimatedDeliveryTime());
        }

        // ================= Bill (Proof of Delivery) =================

        // Same data the admin/operator "Generate Bill" PDF is built from
        // (see PodService), just scoped to the requesting customer's own
        // shipment instead of the admin-only /api/admin/pod endpoint.
        public PodResponse getBillForCustomer(String username, String trackingId) {

                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

                Shipment shipment = shipmentRepository.findByTrackingId(trackingId)
                                .orElseThrow(() -> new RuntimeException("Shipment not found"));

                // Security Check: Customer can only view their own shipment's bill
                if (!shipment.getCustomerId().getId().equals(user.getId())) {
                        throw new RuntimeException("Access Denied");
                }

                return podService.getLatestPodForTrackingId(trackingId);
        }

        // ================= Profile =================

        public CustomerProfileResponse getProfile(
                        String username) {

                User customer = userRepository
                                .findByUsername(username)
                                .orElseThrow(() -> new RuntimeException(
                                                "Customer not found"));

                return new CustomerProfileResponse(

                                customer.getId(),

                                customer.getName(),

                                customer.getUsername(),

                                customer.getPhoneNumber(),

                                customer.getRole().toString()

                );
        }

        // UPDATE CUSTOMER PHONE NUMBER

        public String updatePhoneNumber(
                        String username,
                        String phoneNumber) {

                User customer = userRepository
                                .findByUsername(username)
                                .orElseThrow(() -> new RuntimeException(
                                                "Customer not found"));

                String cleanedPhone = phoneNumber.trim();

                // Basic validation
                if (!cleanedPhone.matches(
                                "^\\+?[0-9]{7,15}$")) {

                        throw new IllegalArgumentException(
                                        "Invalid phone number");
                }

                customer.setPhoneNumber(
                                cleanedPhone);

                userRepository.save(customer);

                return cleanedPhone;
        }
}