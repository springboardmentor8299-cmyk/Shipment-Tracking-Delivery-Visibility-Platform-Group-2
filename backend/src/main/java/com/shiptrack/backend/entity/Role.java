package com.shiptrack.backend.entity;

public enum Role {
    CUSTOMER,
    BUSINESS_CLIENT,
    LOGISTICS_OPERATOR,
    SUPPORT_AGENT,
    ADMINISTRATOR;

    public static Role fromString(String value) {
        if (value == null || value.isBlank()) {
            return CUSTOMER;
        }
        String clean = value.trim().toUpperCase();
        if (clean.startsWith("ROLE_")) {
            clean = clean.substring(5);
        }
        if ("ADMIN".equals(clean)) {
            return ADMINISTRATOR;
        }
        try {
            return Role.valueOf(clean);
        } catch (IllegalArgumentException e) {
            return CUSTOMER;
        }
    }
}
