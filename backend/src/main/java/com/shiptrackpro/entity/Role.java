package com.shiptrackpro.entity;

public enum Role {
    CUSTOMER("Customer"),
    BUSINESS_CLIENT("Business Client"),
    LOGISTICS_OPERATOR("Logistics Operator"),
    SUPPORT_AGENT("Support Agent"),
    ADMINISTRATOR("Administrator");

    private final String displayName;

    Role(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static Role fromDisplayName(String text) {
        for (Role role : Role.values()) {
            if (role.displayName.equalsIgnoreCase(text) || role.name().equalsIgnoreCase(text)) {
                return role;
            }
        }
        return CUSTOMER;
    }
}
