package com.shiptrack.impl;

import com.shiptrack.dto.tracking.DriverLocationRequest;
import com.shiptrack.dto.tracking.DriverLocationResponse;
import com.shiptrack.dto.tracking.MapLocationResponse;
import com.shiptrack.dto.tracking.ShipmentLocationResponse;
import com.shiptrack.entity.DriverLocation;
import com.shiptrack.entity.Shipment;
import com.shiptrack.entity.User;
import com.shiptrack.repository.DriverLocationRepository;
import com.shiptrack.repository.ShipmentRepository;
import com.shiptrack.repository.UserRepository;
import com.shiptrack.service.TrackingService;
import com.shiptrack.util.GoogleMapUtil;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TrackingServiceImpl implements TrackingService {

    private final DriverLocationRepository driverLocationRepository;
    private final UserRepository userRepository;
    private final ShipmentRepository shipmentRepository;

    public TrackingServiceImpl(
            DriverLocationRepository driverLocationRepository,
            UserRepository userRepository,
            ShipmentRepository shipmentRepository) {

        this.driverLocationRepository = driverLocationRepository;
        this.userRepository = userRepository;
        this.shipmentRepository = shipmentRepository;
    }

    @Override
    public DriverLocationResponse updateDriverLocation(DriverLocationRequest request) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        User driver = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Driver not found."));

        if (driver.getRole() == null ||
                !"ROLE_DRIVER".equalsIgnoreCase(driver.getRole().getName())) {

            throw new RuntimeException("Only drivers can update their location.");
        }

        if (!GoogleMapUtil.isValidLatitude(request.getLatitude())) {
            throw new RuntimeException("Invalid latitude.");
        }

        if (!GoogleMapUtil.isValidLongitude(request.getLongitude())) {
            throw new RuntimeException("Invalid longitude.");
        }

        DriverLocation location = driverLocationRepository
                .findByDriver(driver)
                .orElse(new DriverLocation());

        location.setDriver(driver);
        location.setLatitude(request.getLatitude());
        location.setLongitude(request.getLongitude());
        location.setSpeed(request.getSpeed());
        location.setHeading(request.getHeading());
        location.setAccuracy(request.getAccuracy());

        DriverLocation saved = driverLocationRepository.save(location);

        return DriverLocationResponse.builder()
                .driverId(driver.getId())
                .latitude(saved.getLatitude())
                .longitude(saved.getLongitude())
                .speed(saved.getSpeed())
                .heading(saved.getHeading())
                .accuracy(saved.getAccuracy())
                .lastUpdated(saved.getLastUpdated() == null
                        ? null
                        : saved.getLastUpdated()
                        .format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                .build();
    }

    @Override
    public ShipmentLocationResponse getShipmentLocation(Long shipmentId) {

        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new RuntimeException("Shipment not found."));

        if (shipment.getDriver() == null) {
            throw new RuntimeException("No driver assigned to this shipment.");
        }

        DriverLocation location = driverLocationRepository
                .findByDriver(shipment.getDriver())
                .orElseThrow(() ->
                        new RuntimeException("Driver location not found."));

        return ShipmentLocationResponse.builder()
                .shipmentId(shipment.getId())
                .trackingNumber(shipment.getTrackingNumber())
                .latitude(location.getLatitude())
                .longitude(location.getLongitude())
                .shipmentStatus(shipment.getShipmentStatus().name())
                .build();
    }

    @Override
    public List<MapLocationResponse> getAllDriverLocations() {

        return driverLocationRepository.findAll()
                .stream()
                .map(location -> MapLocationResponse.builder()
                        .driverId(location.getDriver().getId())
                        .driverName(location.getDriver().getFullName())
                        .latitude(location.getLatitude())
                        .longitude(location.getLongitude())
                        .build())
                .collect(Collectors.toList());
    }
}