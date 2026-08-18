package com.shiptrack.backend.dto;

public class LoginResponse {

    private String token;
    private String message;
    private String role;
    private String username;
    private String email;
    private Long id;

    public LoginResponse() {
    }

    public LoginResponse(String token, String message, String role, String username, String email, Long id) {
        this.token = token;
        this.message = message;
        this.role = role;
        this.username = username;
        this.email = email;
        this.id = id;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}
