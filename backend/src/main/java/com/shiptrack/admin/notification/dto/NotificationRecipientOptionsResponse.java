package com.shiptrack.admin.notification.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class NotificationRecipientOptionsResponse {

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