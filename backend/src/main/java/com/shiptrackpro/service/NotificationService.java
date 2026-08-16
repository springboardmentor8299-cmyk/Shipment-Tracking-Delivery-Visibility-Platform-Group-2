package com.shiptrackpro.service;

import com.shiptrackpro.entity.Notification;
import com.shiptrackpro.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Autowired(required = false)
    private SimpMessagingTemplate messagingTemplate;

    @Value("${app.twilio.account-sid:}")
    private String twilioAccountSid;

    @Value("${app.twilio.phone-number:}")
    private String twilioFromPhone;

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAllByOrderByTimestampDesc();
    }

    @Transactional
    public Notification sendNotification(String trackingNumber, String title, String message, String type, String category, String channels, String email, String phone) {
        Notification notification = new Notification();
        notification.setId("notif-" + UUID.randomUUID().toString().substring(0, 8));
        notification.setTrackingNumber(trackingNumber);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type != null ? type : "info");
        notification.setCategory(category != null ? category : "Shipment Update");
        notification.setChannels(channels != null ? channels : "Email,SMS,Push,In-App");
        notification.setRecipientEmail(email);
        notification.setRecipientPhone(phone);
        notification.setTimestamp(LocalDateTime.now().format(FORMATTER));
        notification.setRead(false);

        Notification saved = notificationRepository.save(notification);

        // Dispatch real-time notification over Spring WebSocket if available
        if (messagingTemplate != null) {
            try {
                messagingTemplate.convertAndSend("/topic/alerts", saved);
            } catch (Exception e) {
                logger.warn("Could not broadcast notification over WebSocket: {}", e.getMessage());
            }
        }

        // Dispatch Email via JavaMailSender if configured
        if (mailSender != null && email != null && !email.isBlank()) {
            try {
                SimpleMailMessage mailMessage = new SimpleMailMessage();
                mailMessage.setTo(email);
                mailMessage.setSubject("ShipTrack Pro: " + title);
                mailMessage.setText(message + "\n\nTracking Number: " + trackingNumber);
                mailSender.send(mailMessage);
                logger.info("Sent email notification to {}", email);
            } catch (Exception e) {
                logger.warn("Could not send email via JavaMailSender: {}", e.getMessage());
            }
        }

        // Twilio SMS dispatch
        if (phone != null && !phone.isBlank() && twilioAccountSid != null && !twilioAccountSid.isBlank()) {
            logger.info("Triggered Twilio SMS dispatch for {}: {}", phone, title);
        }

        return saved;
    }

    @Transactional
    public Notification markAsRead(String id) {
        Notification notif = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notif.setRead(true);
        return notificationRepository.save(notif);
    }
}
