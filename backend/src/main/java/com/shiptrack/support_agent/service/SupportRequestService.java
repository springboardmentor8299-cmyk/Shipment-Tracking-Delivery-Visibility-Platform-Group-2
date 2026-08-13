package com.shiptrack.support_agent.service;

import java.util.List;

import com.shiptrack.support_agent.dto.SupportAgentResponseDto;
import com.shiptrack.support_agent.dto.SupportRequestResponseDto;

public interface SupportRequestService {

    List<SupportRequestResponseDto> getAllRequests();

    SupportRequestResponseDto getRequestById(Long id);

    void assignToCurrentAgent(Long id);

    void assignToSupportAgent(Long requestId, Long agentId);

    List<SupportAgentResponseDto> getSupportAgents();

    void updateStatus(Long id, String status);

    void resolveRequest(Long id);

    List<SupportRequestResponseDto> getMyRequests();
}