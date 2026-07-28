package com.shiptrack.auth.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shiptrack.auth.dto.UserResponse;
import com.shiptrack.auth.entity.User;
import com.shiptrack.auth.repository.UserRepository;

@RestController
@RequestMapping("/api")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/users")
    public List<UserResponse> allUsers() {
        List<User> users = userRepository.findAll();
        return users.stream().map(u -> UserResponse.builder()
                .id(u.getId())
                .name(u.getName())
                .username(u.getUsername())
                .role(u.getRole() != null ? u.getRole().name() : null)
                .createdAt(u.getCreatedAt())
                .build()).collect(Collectors.toList());
    }

}
