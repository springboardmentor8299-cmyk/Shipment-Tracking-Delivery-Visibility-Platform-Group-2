package com.shiptrack.admin.pod.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.shiptrack.admin.shipment.entity.Shipment;
import com.shiptrack.admin.shipment.repository.ShipmentRepository;
import com.shiptrack.notification.entity.NotificationType;
import com.shiptrack.notification.service.NotificationService;

@Service
public class PodOtpService {

    private static final long EXPIRY_MINUTES = 10;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final ShipmentRepository shipmentRepository;
    private final NotificationService notificationService;

    private final ConcurrentHashMap<String, OtpEntry> otpStore = new ConcurrentHashMap<>();

    public PodOtpService(ShipmentRepository shipmentRepository, NotificationService notificationService) {
        this.shipmentRepository = shipmentRepository;
        this.notificationService = notificationService;
    }

    public OtpSendResult sendOtp(String trackingId) {
        Shipment shipment = shipmentRepository.findByTrackingId(trackingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "No shipment found with tracking ID " + trackingId));

        String code = generateCode();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(EXPIRY_MINUTES);
        otpStore.put(trackingId, new OtpEntry(code, expiresAt, false));

        try {
            notificationService.notify(
                    shipment.getCustomerId(),
                    NotificationType.DELIVERY_ALERT,
                    "Your delivery verification code",
                    "Share this code with the delivery agent to confirm receipt of shipment "
                            + trackingId + ": " + code + ". It expires in " + EXPIRY_MINUTES + " minutes.",
                    trackingId);
        } catch (Exception ignored) {
        }

        return new OtpSendResult(EXPIRY_MINUTES * 60);
    }

    public boolean verifyOtp(String trackingId, String code) {
        OtpEntry entry = otpStore.get(trackingId);
        if (entry == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "No OTP has been sent for this shipment yet.");
        }
        if (entry.expiresAt().isBefore(LocalDateTime.now())) {
            otpStore.remove(trackingId);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "This OTP has expired. Send a new code.");
        }
        if (code == null || !entry.code().equals(code.trim())) {
            return false;
        }

        otpStore.put(trackingId, new OtpEntry(entry.code(), entry.expiresAt(), true));
        return true;
    }

    public boolean isVerified(String trackingId) {
        OtpEntry entry = otpStore.get(trackingId);
        return entry != null && entry.verified() && entry.expiresAt().isAfter(LocalDateTime.now());
    }

    public void clear(String trackingId) {
        otpStore.remove(trackingId);
    }

    private String generateCode() {
        return String.format("%06d", RANDOM.nextInt(1_000_000));
    }

    private record OtpEntry(String code, LocalDateTime expiresAt, boolean verified) {
    }

    public record OtpSendResult(long expiresInSeconds) {
    }

}
