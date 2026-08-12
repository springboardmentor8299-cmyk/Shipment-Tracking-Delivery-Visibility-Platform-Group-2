package com.shiptrack.repository;

import com.shiptrack.entity.DriverLocation;
import com.shiptrack.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DriverLocationRepository extends JpaRepository<DriverLocation, Long> {

    Optional<DriverLocation> findByDriver(User driver);

    boolean existsByDriver(User driver);

    void deleteByDriver(User driver);

    void deleteByDriver_Id(Long driverId);
}
