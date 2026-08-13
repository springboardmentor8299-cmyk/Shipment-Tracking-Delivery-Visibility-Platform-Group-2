package com.shiptrack.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPreferenceRequest {

    private boolean emailEnabled;
    private boolean smsEnabled;
    private boolean pushEnabled;

    private boolean shipmentUpdates;
    private boolean etaUpdates;
    private boolean deliveryAlerts;
    private boolean delayWarnings;
}
