package com.shiptrack.dto;

public class ActivityResponse {

    private String title;

    private String description;

    private String icon;

    private String color;

    private String time;

    public ActivityResponse() {
    }

    public ActivityResponse(
            String title,
            String description,
            String icon,
            String color,
            String time) {

        this.title = title;
        this.description = description;
        this.icon = icon;
        this.color = color;
        this.time = time;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }
}