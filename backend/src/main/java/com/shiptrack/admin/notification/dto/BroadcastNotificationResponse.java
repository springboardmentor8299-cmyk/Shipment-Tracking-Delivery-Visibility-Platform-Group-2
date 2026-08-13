package com.shiptrack.admin.notification.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class BroadcastNotificationResponse {

    private List<String> targetedRoles;

    private int matchedUserCount;

    private int notifiedUserCount;

}
