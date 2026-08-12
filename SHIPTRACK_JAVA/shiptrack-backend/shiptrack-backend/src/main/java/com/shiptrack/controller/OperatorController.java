package com.shiptrack.controller;

import com.shiptrack.dto.OperatorRequest;
import com.shiptrack.dto.OperatorResponse;
import com.shiptrack.dto.OperatorStatsResponse;
import com.shiptrack.service.OperatorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/operators")
@CrossOrigin(origins = "*")
public class OperatorController {

    private final OperatorService operatorService;

    public OperatorController(OperatorService operatorService) {
        this.operatorService = operatorService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OperatorResponse createOperator(
            @Valid @RequestBody OperatorRequest request) {

        return operatorService.createOperator(request);
    }

    @GetMapping
    public List<OperatorResponse> getAllOperators() {
        return operatorService.getAllOperators();
    }

    @GetMapping("/{id}")
    public OperatorResponse getOperatorById(@PathVariable Long id) {
        return operatorService.getOperatorById(id);
    }

    @PutMapping("/{id}")
    public OperatorResponse updateOperator(
            @PathVariable Long id,
            @Valid @RequestBody OperatorRequest request) {

        return operatorService.updateOperator(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteOperator(@PathVariable Long id) {
        operatorService.deleteOperator(id);
    }

    @GetMapping("/stats")
    public OperatorStatsResponse getOperatorStats() {
        return operatorService.getOperatorStats();
    }

    @GetMapping("/search")
    public List<OperatorResponse> searchOperators(
            @RequestParam String keyword) {

        return operatorService.searchOperators(keyword);
    }
}