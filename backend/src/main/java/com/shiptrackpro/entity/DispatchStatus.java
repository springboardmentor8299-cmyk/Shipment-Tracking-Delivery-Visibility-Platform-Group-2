package com.shiptrackpro.entity;

public enum DispatchStatus {
    UNASSIGNED("Unassigned"),
    PENDING_ACCEPTANCE("Pending Acceptance"),
    ACCEPTED("Accepted"),
    DECLINED("Declined");

    private final String displayName;

    DispatchStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static DispatchStatus fromDisplayName(String text) {
        if (text == null) return UNASSIGNED;
        for (DispatchStatus status : DispatchStatus.values()) {
            if (status.displayName.equalsIgnoreCase(text) || status.name().equalsIgnoreCase(text.replace(" ", "_"))) {
                return status;
            }
        }
        return UNASSIGNED;
    }
}
