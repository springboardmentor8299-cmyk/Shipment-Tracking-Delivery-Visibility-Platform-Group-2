package com.shiptrackpro.entity;

public enum PriorityLevel {
    STANDARD("Standard"),
    EXPRESS("Express"),
    OVERNIGHT("Overnight"),
    CRITICAL_FREIGHT("Critical Freight");

    private final String displayName;

    PriorityLevel(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static PriorityLevel fromDisplayName(String text) {
        if (text == null) return STANDARD;
        for (PriorityLevel level : PriorityLevel.values()) {
            if (level.displayName.equalsIgnoreCase(text) || level.name().equalsIgnoreCase(text.replace(" ", "_"))) {
                return level;
            }
        }
        return STANDARD;
    }
}
