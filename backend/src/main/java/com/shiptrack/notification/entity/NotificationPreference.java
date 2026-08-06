package com.shiptrack.notification.entity;

import com.shiptrack.auth.entity.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// One row per user. Created lazily with sane defaults the first time
// a user's preferences are read or updated.
@Entity
@Table(name = "notification_preferences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // (v) Channels
    @Column(name = "email_enabled", nullable = false)
    @Builder.Default
    private boolean emailEnabled = true;

    @Column(name = "sms_enabled", nullable = false)
    @Builder.Default
    private boolean smsEnabled = false;

    @Column(name = "push_enabled", nullable = false)
    @Builder.Default
    private boolean pushEnabled = false;

    // (vi) Categories
    @Column(name = "shipment_updates", nullable = false)
    @Builder.Default
    private boolean shipmentUpdates = true;

    @Column(name = "eta_updates", nullable = false)
    @Builder.Default
    private boolean etaUpdates = true;

    @Column(name = "delivery_alerts", nullable = false)
    @Builder.Default
    private boolean deliveryAlerts = true;

    @Column(name = "delay_warnings", nullable = false)
    @Builder.Default
    private boolean delayWarnings = true;
}
