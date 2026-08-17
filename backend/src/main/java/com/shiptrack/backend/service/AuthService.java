package com.shiptrack.backend.service;

import com.shiptrack.backend.dto.AuthResponse;
import com.shiptrack.backend.dto.LoginRequest;
import com.shiptrack.backend.dto.RegisterRequest;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

}