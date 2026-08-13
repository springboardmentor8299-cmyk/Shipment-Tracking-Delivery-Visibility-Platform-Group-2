package com.shiptrack.customer.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class CustomerProfileResponse {

    private Long id;
    private String name;
    private String username;
    private String phoneNumber;
    private String role;

}