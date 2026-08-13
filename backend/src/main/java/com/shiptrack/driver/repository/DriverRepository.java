package com.shiptrack.driver.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shiptrack.driver.entity.Driver;

public interface DriverRepository extends JpaRepository<Driver, Long> {

    Optional<Driver> findByUser_Id(Long userId);

    boolean existsByLicenseNumber(String licenseNumber);

}
