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

    // How many users matched the selected roles.
    private int matchedUserCount;

    // How many actually got a Notification row (a user can be skipped if
    // they've turned the target category off in their preferences).
    private int notifiedUserCount;

}
