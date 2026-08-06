package com.shiptrack.auth.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromAddress;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendPasswordResetEmail(String toAddress, String resetLink) {

        SimpleMailMessage message = new SimpleMailMessage();

        if (fromAddress != null && !fromAddress.isBlank()) {
            message.setFrom(fromAddress);
        }

        message.setTo(toAddress);
        message.setSubject("ShipTrack - Reset Your Password");
        message.setText(
                "Hi,\n\n" +
                        "We received a request to reset your ShipTrack password.\n\n" +
                        "Click the link below to choose a new password. This link expires in 30 minutes " +
                        "and can only be used once:\n\n" +
                        resetLink + "\n\n" +
                        "If you didn't request this, you can safely ignore this email — your password " +
                        "will remain unchanged.\n\n" +
                        "- ShipTrack Team");

        mailSender.send(message);
    }

    // Used by NotificationService for the email notification channel.
    public void sendNotificationEmail(String toAddress, String title, String body) {

        SimpleMailMessage message = new SimpleMailMessage();

        if (fromAddress != null && !fromAddress.isBlank()) {
            message.setFrom(fromAddress);
        }

        message.setTo(toAddress);
        message.setSubject("ShipTrack - " + title);
        message.setText(body + "\n\n- ShipTrack Team");

        mailSender.send(message);
    }
}
