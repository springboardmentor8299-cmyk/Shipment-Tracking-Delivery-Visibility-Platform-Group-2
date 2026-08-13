package com.shiptrack.admin.notification.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BroadcastNotificationRequest {

    private List<String> roles;

    private List<Long> userIds;

    private String title;

    private String message;

    private String type;

    private String trackingId;

}
