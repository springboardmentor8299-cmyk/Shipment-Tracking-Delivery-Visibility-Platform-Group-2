package com.shiptrack.notification.entity;

public enum NotificationType {

    SHIPMENT_UPDATE, // (i) Shipment updates
    ETA_UPDATE, // (ii) ETA notifications
    DELIVERY_ALERT, // (iii) Delivery alerts
    DELAY_WARNING, // (iv) Delay warnings
    SYSTEM // fallback / general system notices

}
