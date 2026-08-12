package com.shiptrack.dto;

public class SystemHealthResponse {

    private String service;
    private String status;

    public SystemHealthResponse() {
    }

    public SystemHealthResponse(String service, String status) {
        this.service = service;
        this.status = status;
    }

    public String getService() {
        return service;
    }

    public void setService(String service) {
        this.service = service;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}