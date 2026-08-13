package com.shiptrack.driver.entity;

public enum VehicleType {

    TRUCK(50),

    VAN(20),

    MINI_TRUCK(30),

    BIKE(10);

    private final int maxShipmentCapacity;

    VehicleType(int maxShipmentCapacity) {
        this.maxShipmentCapacity = maxShipmentCapacity;
    }

    public int getMaxShipmentCapacity() {
        return maxShipmentCapacity;
    }

}
