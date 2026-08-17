package com.shiptrackpro.entity;

public enum ShipmentStatus {
    CREATED("Created"),
    PICKED_UP("Picked Up"),
    IN_TRANSIT("In Transit"),
    OUT_FOR_DELIVERY("Out for Delivery"),
    DELIVERED("Delivered"),
    FAILED_DELIVERY("Failed Delivery"),
    CANCELLED("Cancelled");

    private final String displayName;

    ShipmentStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static ShipmentStatus fromDisplayName(String text) {
        if (text == null) return CREATED;
        for (ShipmentStatus status : ShipmentStatus.values()) {
            if (status.displayName.equalsIgnoreCase(text) || status.name().equalsIgnoreCase(text.replace(" ", "_"))) {
                return status;
            }
        }
        return CREATED;
    }
}
