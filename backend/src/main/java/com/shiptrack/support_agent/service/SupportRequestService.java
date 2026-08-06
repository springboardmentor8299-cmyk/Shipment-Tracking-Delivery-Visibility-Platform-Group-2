package com.shiptrack.support_agent.service;

import java.util.List;

import com.shiptrack.support_agent.dto.SupportRequestResponseDto;

public interface SupportRequestService {

    /**
     * Returns all customer support requests.
     */
    List<SupportRequestResponseDto> getAllRequests();

    /**
     * Returns one request.
     */
    SupportRequestResponseDto getRequestById(Long id);

    /**
     * Logged-in support agent assigns request to himself.
     */
    void assignToCurrentAgent(Long id);

    /**
     * Update request status.
     */
    void updateStatus(Long id, String status);

    /**
     * Resolve request.
     */
    void resolveRequest(Long id);

}