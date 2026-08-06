package com.shiptrack.admin.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shiptrack.support_agent.dto.SupportRequestResponseDto;
import com.shiptrack.support_agent.service.SupportRequestService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/support")
@RequiredArgsConstructor
public class AdminSupportController {

    private final SupportRequestService supportRequestService;

    @GetMapping("/requests")
    public ResponseEntity<List<SupportRequestResponseDto>> getAllRequests() {
        return ResponseEntity.ok(
                supportRequestService.getAllRequests());
    }

    @GetMapping("/requests/{id}")
    public ResponseEntity<SupportRequestResponseDto> getRequest(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                supportRequestService.getRequestById(id));
    }
}