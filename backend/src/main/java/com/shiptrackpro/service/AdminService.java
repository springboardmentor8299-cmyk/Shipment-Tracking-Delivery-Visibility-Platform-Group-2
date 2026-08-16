package com.shiptrackpro.service;

import com.shiptrackpro.entity.*;
import com.shiptrackpro.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class AdminService {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    @Autowired
    private EscalationRepository escalationRepository;

    @Autowired
    private BusinessApprovalRepository businessApprovalRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private PlatformSettingRepository platformSettingRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Escalation> getAllEscalations() {
        return escalationRepository.findAll();
    }

    @Transactional
    public Escalation resolveEscalation(String id, String resolution, String resolvedBy) {
        Escalation esc = escalationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Escalation not found"));
        esc.setStatus("Resolved");
        esc.setAgentDecision("Admin Resolution: " + resolution + " (By: " + resolvedBy + ")");
        return escalationRepository.save(esc);
    }

    public List<BusinessApproval> getAllBusinessApprovals() {
        return businessApprovalRepository.findAll();
    }

    @Transactional
    public BusinessApproval updateBusinessApprovalStatus(String id, String status) {
        BusinessApproval app = businessApprovalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Business approval record not found"));
        app.setStatus(status);
        if ("Approved".equalsIgnoreCase(status)) {
            app.setVerificationStatus("Fully Verified");
        } else if ("Rejected".equalsIgnoreCase(status)) {
            app.setVerificationStatus("Rejected / Non-Compliant Documents");
        }
        return businessApprovalRepository.save(app);
    }

    public List<AuditLog> getAuditLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }

    @Transactional
    public AuditLog createAuditLog(AuditLog log) {
        if (log.getId() == null) {
            log.setId("audit-" + UUID.randomUUID().toString().substring(0, 8));
        }
        if (log.getTimestamp() == null) {
            log.setTimestamp(LocalDateTime.now().format(FORMATTER));
        }
        return auditLogRepository.save(log);
    }

    public PlatformSetting getPlatformSettings() {
        return platformSettingRepository.findById("default_settings")
                .orElseGet(() -> platformSettingRepository.save(new PlatformSetting()));
    }

    @Transactional
    public PlatformSetting updatePlatformSettings(PlatformSetting newSettings) {
        newSettings.setId("default_settings");
        return platformSettingRepository.save(newSettings);
    }

    @Transactional
    public User updateUserRole(String userId, String roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(Role.fromDisplayName(roleName));
        return userRepository.save(user);
    }
}
