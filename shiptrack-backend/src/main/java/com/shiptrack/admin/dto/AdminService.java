package com.shiptrack.admin;

import com.shiptrack.admin.dto.CreateUserRequest;
import com.shiptrack.admin.dto.DashboardStatsResponse;
import com.shiptrack.shipment.ShipmentRepository;
import com.shiptrack.shipment.ShipmentStatus;
import com.shiptrack.user.Role;
import com.shiptrack.user.User;
import com.shiptrack.user.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final ShipmentRepository shipmentRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(
            UserRepository userRepository,
            ShipmentRepository shipmentRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.shipmentRepository = shipmentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User createStaff(CreateUserRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        if (userRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("Phone already exists");
        }

        if (!request.getRole().equals("LOGISTICS_OPERATOR")
                && !request.getRole().equals("SUPPORT_AGENT")
                && !request.getRole().equals("ADMINISTRATOR")) {

            throw new RuntimeException("Invalid staff role");
        }

        User user = new User();

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.valueOf(request.getRole()));

        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public DashboardStatsResponse getDashboardStats() {

        DashboardStatsResponse stats = new DashboardStatsResponse();

        stats.setTotalUsers(userRepository.count());

        stats.setTotalShipments(shipmentRepository.count());

        stats.setPending(
                shipmentRepository.countByStatus(ShipmentStatus.PENDING)
        );

        stats.setPickedUp(
                shipmentRepository.countByStatus(ShipmentStatus.PICKED_UP)
        );

        stats.setInTransit(
                shipmentRepository.countByStatus(ShipmentStatus.IN_TRANSIT)
        );

        stats.setOutForDelivery(
                shipmentRepository.countByStatus(ShipmentStatus.OUT_FOR_DELIVERY)
        );

        stats.setDelivered(
                shipmentRepository.countByStatus(ShipmentStatus.DELIVERED)
        );

        stats.setCancelled(
                shipmentRepository.countByStatus(ShipmentStatus.CANCELLED)
        );

        return stats;
    }
}