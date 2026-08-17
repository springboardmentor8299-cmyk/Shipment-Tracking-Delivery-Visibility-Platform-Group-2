package com.shiptrack.backend.service.impl;

import com.shiptrack.backend.entity.Driver;
import com.shiptrack.backend.repository.DriverRepository;
import com.shiptrack.backend.service.DriverService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DriverServiceImpl implements DriverService {

    private final DriverRepository driverRepository;

    public DriverServiceImpl(DriverRepository driverRepository) {
        this.driverRepository = driverRepository;
    }

    @Override
    public List<Driver> getAllDrivers() {
        return driverRepository.findAll();
    }

    @Override
    public Driver getDriverById(Long id) {
        return driverRepository.findById(id).orElse(null);
    }

    @Override
    public Driver createDriver(Driver driver) {
        return driverRepository.save(driver);
    }

    @Override
    public Driver updateDriver(Long id, Driver driver) {

        Driver existing = driverRepository.findById(id).orElse(null);

        if (existing == null) {
            return null;
        }

        existing.setName(driver.getName());
        existing.setEmail(driver.getEmail());
        existing.setPhone(driver.getPhone());
        existing.setVehicleNumber(driver.getVehicleNumber());
        existing.setLicenseNumber(driver.getLicenseNumber());
        existing.setStatus(driver.getStatus());

        return driverRepository.save(existing);
    }

    @Override
    public void deleteDriver(Long id) {
        driverRepository.deleteById(id);
    }
}