package com.shiptrack.service;

import java.util.List;

import com.shiptrack.dto.OperatorRequest;
import com.shiptrack.dto.OperatorResponse;
import com.shiptrack.dto.OperatorStatsResponse;
import com.shiptrack.entity.Operator;
import com.shiptrack.repository.OperatorRepository;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class OperatorService {

    private final OperatorRepository operatorRepository;

    public OperatorService(OperatorRepository operatorRepository) {
        this.operatorRepository = operatorRepository;
    }


    private OperatorResponse convertToResponse(Operator operator) {

        OperatorResponse response = new OperatorResponse();

        response.setId(operator.getId());
        response.setOperatorName(operator.getOperatorName());
        response.setEmail(operator.getEmail());
        response.setPhone(operator.getPhone());
        response.setLicenseNumber(operator.getLicenseNumber());
        response.setVehicleType(operator.getVehicleType());
        response.setAssignedRegion(operator.getAssignedRegion());
        response.setAddress(operator.getAddress());
        response.setCity(operator.getCity());
        response.setState(operator.getState());
        response.setCountry(operator.getCountry());
        response.setPostalCode(operator.getPostalCode());
        response.setIsActive(operator.getIsActive());
        response.setCreatedAt(operator.getCreatedAt());
        response.setUpdatedAt(operator.getUpdatedAt());

        return response;
    }


    public OperatorResponse createOperator(OperatorRequest request) {

        if (operatorRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException(
                    "An operator with this email already exists.");
        }

        if (operatorRepository.existsByLicenseNumber(request.getLicenseNumber())) {
            throw new IllegalArgumentException(
                    "An operator with this license number already exists.");
        }

        Operator operator = new Operator();

        operator.setOperatorName(request.getOperatorName());
        operator.setEmail(request.getEmail());
        operator.setPhone(request.getPhone());
        operator.setLicenseNumber(request.getLicenseNumber());
        operator.setVehicleType(request.getVehicleType());
        operator.setAssignedRegion(request.getAssignedRegion());
        operator.setAddress(request.getAddress());
        operator.setCity(request.getCity());
        operator.setState(request.getState());
        operator.setCountry(request.getCountry());
        operator.setPostalCode(request.getPostalCode());
        operator.setIsActive(request.getIsActive());

        Operator savedOperator = operatorRepository.save(operator);

        return convertToResponse(savedOperator);
    }


    public List<OperatorResponse> getAllOperators() {

        return operatorRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }


    public OperatorResponse getOperatorById(Long id) {

        Operator operator = operatorRepository.findById(id)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Operator not found with ID: " + id));

        return convertToResponse(operator);
    }


    public OperatorResponse updateOperator(Long id, OperatorRequest request) {

        Operator operator = operatorRepository.findById(id)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Operator not found with ID: " + id));

        if (!operator.getEmail().equalsIgnoreCase(request.getEmail())
                && operatorRepository.existsByEmail(request.getEmail())) {

            throw new IllegalArgumentException(
                    "An operator with this email already exists.");
        }

        if (!operator.getLicenseNumber().equalsIgnoreCase(request.getLicenseNumber())
                && operatorRepository.existsByLicenseNumber(request.getLicenseNumber())) {

            throw new IllegalArgumentException(
                    "An operator with this license number already exists.");
        }

        operator.setOperatorName(request.getOperatorName());
        operator.setEmail(request.getEmail());
        operator.setPhone(request.getPhone());
        operator.setLicenseNumber(request.getLicenseNumber());
        operator.setVehicleType(request.getVehicleType());
        operator.setAssignedRegion(request.getAssignedRegion());
        operator.setAddress(request.getAddress());
        operator.setCity(request.getCity());
        operator.setState(request.getState());
        operator.setCountry(request.getCountry());
        operator.setPostalCode(request.getPostalCode());
        operator.setIsActive(request.getIsActive());

        Operator updatedOperator = operatorRepository.save(operator);

        return convertToResponse(updatedOperator);
    }


    public void deleteOperator(Long id) {

        if (!operatorRepository.existsById(id)) {
            throw new EntityNotFoundException(
                    "Operator not found with ID: " + id);
        }

        operatorRepository.deleteById(id);
    }

    public OperatorStatsResponse getOperatorStats() {

        long totalOperators = operatorRepository.count();

        long activeOperators = operatorRepository.countByIsActiveTrue();

        long inactiveOperators = operatorRepository.countByIsActiveFalse();

        return new OperatorStatsResponse(
                totalOperators,
                activeOperators,
                inactiveOperators
        );
    }

    public List<OperatorResponse> searchOperators(String keyword) {

        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllOperators();
        }

        return operatorRepository
                .findByOperatorNameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrAssignedRegionContainingIgnoreCase(
                        keyword.trim(),
                        keyword.trim(),
                        keyword.trim()
                )
                .stream()
                .map(this::convertToResponse)
                .toList();
    }
}