package com.shiptrack.controller;

import com.shiptrack.dto.ChangePasswordRequest;
import com.shiptrack.dto.UpdateProfileRequest;
import com.shiptrack.dto.UserProfileResponse;
import com.shiptrack.service.SettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = "*")
public class SettingsController {

    private final SettingsService settingsService;

    public SettingsController(SettingsService settingsService) {
        this.settingsService = settingsService;
    }

    


    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getProfile() {

        UserProfileResponse response = settingsService.getProfile();

        return ResponseEntity.ok(response);
    }

    


    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @RequestBody UpdateProfileRequest request) {

        UserProfileResponse response =
                settingsService.updateProfile(request);

        return ResponseEntity.ok(response);
    }

    


    @PutMapping("/change-password")
    public ResponseEntity<String> changePassword(
            @RequestBody ChangePasswordRequest request) {

        settingsService.changePassword(request);

        return ResponseEntity.ok("Password changed successfully.");
    }
}
