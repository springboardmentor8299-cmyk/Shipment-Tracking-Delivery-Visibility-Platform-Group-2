package com.shiptrack.support_agent.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.shiptrack.support_agent.dto.SupportAgentResponseDto;
import com.shiptrack.support_agent.dto.SupportRequestResponseDto;
import com.shiptrack.support_agent.service.SupportRequestService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/support/requests")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class SupportRequestController {

        private final SupportRequestService supportRequestService;

        @GetMapping
        public ResponseEntity<List<SupportRequestResponseDto>> getAllRequests() {

                return ResponseEntity.ok(
                                supportRequestService.getAllRequests());
        }

        @GetMapping("/{id}")
        public ResponseEntity<SupportRequestResponseDto> getRequestById(
                        @PathVariable Long id) {

                return ResponseEntity.ok(
                                supportRequestService.getRequestById(id));
        }

        @GetMapping("/agents")
        public ResponseEntity<List<SupportAgentResponseDto>> getSupportAgents() {

                return ResponseEntity.ok(
                                supportRequestService.getSupportAgents());
        }

        @PutMapping("/{id}/assign")
        public ResponseEntity<String> assignRequest(
                        @PathVariable Long id) {

                supportRequestService.assignToCurrentAgent(id);

                return ResponseEntity.ok(
                                "Support Request assigned successfully.");
        }

        @PutMapping("/{id}/assign/{agentId}")
        public ResponseEntity<String> assignRequestToAgent(
                        @PathVariable Long id,
                        @PathVariable Long agentId) {

                supportRequestService.assignToSupportAgent(
                                id,
                                agentId);

                return ResponseEntity.ok(
                                "Support Request assigned successfully.");
        }

        @PutMapping("/{id}/status")
        public ResponseEntity<String> updateStatus(
                        @PathVariable Long id,
                        @RequestParam String status) {

                supportRequestService.updateStatus(id, status);

                return ResponseEntity.ok(
                                "Support Request status updated successfully.");
        }

        @PutMapping("/{id}/resolve")
        public ResponseEntity<String> resolveRequest(
                        @PathVariable Long id) {

                supportRequestService.resolveRequest(id);

                return ResponseEntity.ok(
                                "Support Request resolved successfully.");
        }

        @GetMapping("/my-requests")
        public ResponseEntity<List<SupportRequestResponseDto>> getMyRequests() {

                return ResponseEntity.ok(
                                supportRequestService.getMyRequests());
        }
}