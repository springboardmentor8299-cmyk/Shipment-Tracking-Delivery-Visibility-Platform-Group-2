package com.shiptrack.admin.service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.shiptrack.admin.dto.CreateStaffRequest;
import com.shiptrack.admin.dto.DashboardResponse;
import com.shiptrack.admin.dto.MonthlyShipmentOverviewResponse;
import com.shiptrack.admin.dto.ShipmentStatusCountResponse;
import com.shiptrack.admin.shipment.entity.ShipmentStatus;
import com.shiptrack.admin.shipment.repository.ShipmentRepository;
import com.shiptrack.auth.dto.UserResponse;
import com.shiptrack.auth.entity.Role;
import com.shiptrack.auth.entity.User;
import com.shiptrack.auth.repository.UserRepository;

@Service
public class AdminService {

    private static final Set<Role> CREATABLE_STAFF_ROLES = EnumSet.of(
            Role.SUPPORT_AGENT,
            Role.LOGISTICS_OPERATOR,
            Role.BUSINESS_CLIENT);

    private final UserRepository userRepository;

    private final ShipmentRepository shipmentRepository;

    private final PasswordEncoder passwordEncoder;

    public AdminService(UserRepository userRepository,
            ShipmentRepository shipmentRepository, PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.shipmentRepository = shipmentRepository;
        this.passwordEncoder = passwordEncoder;

    }

    public DashboardResponse getDashboardStats() {

        long totalUsers = userRepository.count();

        long totalShipments = shipmentRepository.count();

        long activeDeliveries = shipmentRepository.countByStatus(
                ShipmentStatus.IN_TRANSIT);

        long deliveredToday = shipmentRepository.countByStatusAndDeliveryDate(
                ShipmentStatus.DELIVERED,
                LocalDate.now());

        return DashboardResponse.builder()

                .totalUsers(totalUsers)

                .totalShipments(totalShipments)

                .activeDeliveries(activeDeliveries)

                .deliveredToday(deliveredToday)

                .build();

    }

    public List<MonthlyShipmentOverviewResponse> getMonthlyShipmentOverview() {
        LocalDate fromDate = LocalDate.now().minusMonths(5).withDayOfMonth(1);
        List<Object[]> rawCounts = shipmentRepository.countShipmentsByMonthSince(fromDate);

        List<MonthlyShipmentOverviewResponse> results = new ArrayList<>();

        for (Object[] row : rawCounts) {
            Integer month = (Integer) row[0];
            Integer year = (Integer) row[1];
            Long count = (Long) row[2];
            YearMonth yearMonth = YearMonth.of(year, month);
            String label = yearMonth.getMonth().name().substring(0, 3);
            results.add(new MonthlyShipmentOverviewResponse(label, count));
        }

        return results;
    }

    public List<ShipmentStatusCountResponse> getShipmentStatusCounts() {
        List<Object[]> rawCounts = shipmentRepository.countShipmentsByStatus();
        List<ShipmentStatusCountResponse> results = new ArrayList<>();

        for (Object[] row : rawCounts) {
            ShipmentStatus status = (ShipmentStatus) row[0];
            Long count = (Long) row[1];
            results.add(
                    ShipmentStatusCountResponse.builder()
                            .status(status)
                            .count(count)
                            .build());
        }

        return results;
    }

    public UserResponse createStaffUser(CreateStaffRequest request) {

        if (request.getRole() == null || !CREATABLE_STAFF_ROLES.contains(request.getRole())) {
            throw new RuntimeException(
                    "Role must be one of: SUPPORT_AGENT, LOGISTICS_OPERATOR, BUSINESS_CLIENT");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        User user = User.builder()
                .name(request.getName())
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();

        userRepository.save(user);

        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .username(user.getUsername())
                .role(user.getRole().name())
                .createdAt(user.getCreatedAt())
                .build();
    }

}