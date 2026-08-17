package com.shiptrackpro.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "platform_settings")
public class PlatformSetting {

    @Id
    @Column(length = 64)
    private String id = "default_settings";

    private String platformName = "ShipTrack Pro Control Tower";
    private String timezone = "IST (UTC+05:30) Mumbai / New Delhi";
    private String currency = "USD ($) / INR (₹)";
    private Boolean autoAssignmentEnabled = true;
    private Integer delayThresholdMins = 30;
    private Integer escalationThresholdHours = 2;
    private Boolean emailNotificationsEnabled = true;
    private Boolean smsNotificationsEnabled = true;
    private Boolean pushNotificationsEnabled = true;

    public PlatformSetting() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPlatformName() { return platformName; }
    public void setPlatformName(String platformName) { this.platformName = platformName; }

    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public Boolean getAutoAssignmentEnabled() { return autoAssignmentEnabled; }
    public void setAutoAssignmentEnabled(Boolean autoAssignmentEnabled) { this.autoAssignmentEnabled = autoAssignmentEnabled; }

    public Integer getDelayThresholdMins() { return delayThresholdMins; }
    public void setDelayThresholdMins(Integer delayThresholdMins) { this.delayThresholdMins = delayThresholdMins; }

    public Integer getEscalationThresholdHours() { return escalationThresholdHours; }
    public void setEscalationThresholdHours(Integer escalationThresholdHours) { this.escalationThresholdHours = escalationThresholdHours; }

    public Boolean getEmailNotificationsEnabled() { return emailNotificationsEnabled; }
    public void setEmailNotificationsEnabled(Boolean emailNotificationsEnabled) { this.emailNotificationsEnabled = emailNotificationsEnabled; }

    public Boolean getSmsNotificationsEnabled() { return smsNotificationsEnabled; }
    public void setSmsNotificationsEnabled(Boolean smsNotificationsEnabled) { this.smsNotificationsEnabled = smsNotificationsEnabled; }

    public Boolean getPushNotificationsEnabled() { return pushNotificationsEnabled; }
    public void setPushNotificationsEnabled(Boolean pushNotificationsEnabled) { this.pushNotificationsEnabled = pushNotificationsEnabled; }
}
