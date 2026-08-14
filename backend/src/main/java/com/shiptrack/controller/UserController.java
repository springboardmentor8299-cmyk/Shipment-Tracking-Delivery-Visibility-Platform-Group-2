package com.shiptrack.controller;

import com.shiptrack.dto.CreateEmployeeRequest;
import com.shiptrack.dto.CreateOperatorRequest;
import com.shiptrack.dto.UserResponse;
import com.shiptrack.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserService userService;

    @GetMapping("/operators")
    public ResponseEntity<List<UserResponse>> listOperators(Authentication authentication) {
        return ResponseEntity.ok(userService.listDeliveryOperators(authentication.getName()));
    }

    @PostMapping("/operators")
    public ResponseEntity<UserResponse> createOperator(
            @Valid @RequestBody CreateOperatorRequest request,
            Authentication authentication) {
        UserResponse response = userService.createDeliveryOperator(request, authentication.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @DeleteMapping("/operators/{id}")
    public ResponseEntity<Void> deleteOperator(
            @PathVariable Long id,
            Authentication authentication) {
        userService.deleteDeliveryOperator(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/employees")
    public ResponseEntity<List<UserResponse>> listEmployees(Authentication authentication) {
        return ResponseEntity.ok(userService.listEmployees(authentication.getName()));
    }

    @PostMapping("/employees")
    public ResponseEntity<UserResponse> createEmployee(
            @Valid @RequestBody CreateEmployeeRequest request,
            Authentication authentication) {
        UserResponse response = userService.createEmployee(request, authentication.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @DeleteMapping("/employees/{id}")
    public ResponseEntity<Void> deleteEmployee(
            @PathVariable Long id,
            Authentication authentication) {
        userService.deleteEmployee(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
