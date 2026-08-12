package com.shiptrack.service;

import java.util.List;
import com.shiptrack.dto.BusinessRequest;
import com.shiptrack.dto.BusinessResponse;
import com.shiptrack.dto.BusinessStatsResponse;
import com.shiptrack.entity.Business;
import com.shiptrack.repository.BusinessRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class BusinessService {

    private final BusinessRepository businessRepository;

    public BusinessService(BusinessRepository businessRepository) {
        this.businessRepository = businessRepository;
    }

    


    private BusinessResponse convertToResponse(Business business) {

        BusinessResponse response = new BusinessResponse();

        response.setId(business.getId());
        response.setBusinessName(business.getBusinessName());
        response.setOwnerName(business.getOwnerName());
        response.setEmail(business.getEmail());
        response.setPhone(business.getPhone());
        response.setAddress(business.getAddress());
        response.setCity(business.getCity());
        response.setState(business.getState());
        response.setCountry(business.getCountry());
        response.setPostalCode(business.getPostalCode());
        response.setIsActive(business.getIsActive());
        response.setCreatedAt(business.getCreatedAt());
        response.setUpdatedAt(business.getUpdatedAt());

        return response;
    }

    


    public BusinessResponse createBusiness(BusinessRequest request) {

        
        if (businessRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException(
                    "A business with this email already exists.");
        }

        Business business = new Business();

        business.setBusinessName(request.getBusinessName());
        business.setOwnerName(request.getOwnerName());
        business.setEmail(request.getEmail());
        business.setPhone(request.getPhone());
        business.setAddress(request.getAddress());
        business.setCity(request.getCity());
        business.setState(request.getState());
        business.setCountry(request.getCountry());
        business.setPostalCode(request.getPostalCode());
        business.setIsActive(request.getIsActive());

        Business savedBusiness = businessRepository.save(business);

        return convertToResponse(savedBusiness);
    }

    


    public java.util.List<BusinessResponse> getAllBusinesses() {

        return businessRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    


    public BusinessResponse getBusinessById(Long id) {

        Business business = businessRepository.findById(id)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Business not found with ID: " + id));

        return convertToResponse(business);
    }

    


    public BusinessResponse updateBusiness(Long id, BusinessRequest request) {

        Business business = businessRepository.findById(id)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Business not found with ID: " + id));

        
        if (!business.getEmail().equalsIgnoreCase(request.getEmail())
                && businessRepository.existsByEmail(request.getEmail())) {

            throw new IllegalArgumentException(
                    "A business with this email already exists.");
        }

        business.setBusinessName(request.getBusinessName());
        business.setOwnerName(request.getOwnerName());
        business.setEmail(request.getEmail());
        business.setPhone(request.getPhone());
        business.setAddress(request.getAddress());
        business.setCity(request.getCity());
        business.setState(request.getState());
        business.setCountry(request.getCountry());
        business.setPostalCode(request.getPostalCode());
        business.setIsActive(request.getIsActive());

        Business updatedBusiness = businessRepository.save(business);

        return convertToResponse(updatedBusiness);
    }

    


    public void deleteBusiness(Long id) {

        if (!businessRepository.existsById(id)) {
            throw new EntityNotFoundException(
                    "Business not found with ID: " + id);
        }

        businessRepository.deleteById(id);
    }

    


    public BusinessStatsResponse getBusinessStats() {

        long totalBusinesses = businessRepository.count();

        long activeBusinesses =
                businessRepository.countByIsActive(true);

        long inactiveBusinesses =
                businessRepository.countByIsActive(false);

        return new BusinessStatsResponse(
                totalBusinesses,
                activeBusinesses,
                inactiveBusinesses
        );
    }

    


    public List<BusinessResponse> searchBusinesses(String keyword) {

        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllBusinesses();
        }

        return businessRepository
                .findByBusinessNameContainingIgnoreCaseOrOwnerNameContainingIgnoreCase(
                        keyword.trim(),
                        keyword.trim()
                )
                .stream()
                .map(this::convertToResponse)
                .toList();
    }
}