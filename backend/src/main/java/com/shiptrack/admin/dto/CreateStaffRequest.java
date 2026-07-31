package com.shiptrack.admin.dto;

import com.shiptrack.auth.entity.Role;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CreateStaffRequest {

    private String name;
    private String username;
    private String password;
    private Role role;

}