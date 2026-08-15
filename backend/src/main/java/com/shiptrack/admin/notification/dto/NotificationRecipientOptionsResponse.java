package com.shiptrack.admin.notification.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

// Backs the recipient pickers on the "Send Notification" screen: once an
// admin ticks a role group, the frontend shows this list so they can pick
// specific people instead of blasting the whole group.
@Getter
@Builder
@AllArgsConstructor
public class NotificationRecipientOptionsResponse {

    // One row per shipment with a linked customer account — a customer
    // with several shipments shows up once per tracking ID, since that's
    // how the admin identifies "which customer" in this app.
    private List<CustomerOption> customers;

    private List<UserOption> businessClients;

    private List<UserOption> logisticsOperators;

    private List<UserOption> supportAgents;

    private List<UserOption> drivers;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class CustomerOption {
        private String trackingId;
        private Long customerId;
        private String customerName;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class UserOption {
        private Long userId;
        private String name;
        private String username;
    }

}