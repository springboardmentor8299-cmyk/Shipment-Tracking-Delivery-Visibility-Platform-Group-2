package com.shiptrack.controller;

import com.shiptrack.dto.SupportQueryRequest;
import com.shiptrack.dto.SupportQueryRespondRequest;
import com.shiptrack.dto.SupportQueryResponse;
import com.shiptrack.service.SupportQueryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/support-queries")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class SupportQueryController {

    private final SupportQueryService supportQueryService;

    @PostMapping
    public ResponseEntity<SupportQueryResponse> createQuery(
            @Valid @RequestBody SupportQueryRequest request,
            Authentication authentication) {
        SupportQueryResponse response = supportQueryService.createQuery(request, authentication.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/my")
    public ResponseEntity<List<SupportQueryResponse>> getMyQueries(Authentication authentication) {
        return ResponseEntity.ok(supportQueryService.getMyQueries(authentication.getName()));
    }

    @GetMapping
    public ResponseEntity<List<SupportQueryResponse>> getAllQueries(Authentication authentication) {
        return ResponseEntity.ok(supportQueryService.getAllQueries(authentication.getName()));
    }

    @PatchMapping("/{id}/respond")
    public ResponseEntity<SupportQueryResponse> respondToQuery(
            @PathVariable Long id,
            @Valid @RequestBody SupportQueryRespondRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(supportQueryService.respondToQuery(id, request, authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuery(
            @PathVariable Long id,
            Authentication authentication) {
        supportQueryService.deleteQuery(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}