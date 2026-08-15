package com.shiptrack.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Body for PUT /api/notifications/preferences — matches the `prefs` state
// object built from CHANNELS + CATEGORIES in NotificationPreferences.jsx.
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
