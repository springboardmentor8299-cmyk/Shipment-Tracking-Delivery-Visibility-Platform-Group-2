package com.shiptrack.dto;

public class MonthlyShipmentTrendDTO {

    private String month;
    private long count;

    public MonthlyShipmentTrendDTO(
            String month,
            long count) {

        this.month = month;
        this.count = count;
    }

    public String getMonth() {
        return month;
    }

    public long getCount() {
        return count;
    }
}