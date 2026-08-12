package com.shiptrack.dto.customer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerProfileResponse {

    private Long customerId;

    private String fullName;

    private String email;

    private String phone;

    private String role;

    private Boolean isActive;
}