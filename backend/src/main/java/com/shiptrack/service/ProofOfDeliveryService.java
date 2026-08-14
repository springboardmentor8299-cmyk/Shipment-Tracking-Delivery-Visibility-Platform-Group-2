package com.shiptrack.service;

import com.shiptrack.dto.ProofOfDeliveryRequest;
import com.shiptrack.dto.ProofOfDeliveryResponse;
import com.shiptrack.dto.ProofOfDeliveryVerifyRequest;
import com.shiptrack.entity.ProofOfDelivery;
import com.shiptrack.entity.Shipment;
import com.shiptrack.entity.TrackingEvent;
import com.shiptrack.entity.User;
import com.shiptrack.exception.DuplicateResourceException;
import com.shiptrack.exception.ForbiddenException;
import com.shiptrack.exception.ResourceNotFoundException;
import com.shiptrack.repository.ProofOfDeliveryRepository;
import com.shiptrack.repository.ShipmentRepository;
import com.shiptrack.repository.TrackingEventRepository;
import com.shiptrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProofOfDeliveryService {

    private static final String HEX = "0123456789abcdef";

    private final ProofOfDeliveryRepository podRepository;
    private final ShipmentRepository shipmentRepository;
    private final UserRepository userRepository;
    private final TrackingEventRepository trackingEventRepository;

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
    }

    private void requireDeliveryOperator(User user) {
        if (!"DELIVERY_OPERATOR".equalsIgnoreCase(user.getRole())) {
            throw new ForbiddenException("Access denied. Delivery operators only.");
        }
    }

    private void requireAdmin(User user) {
        if (!"ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new ForbiddenException("Access denied. Admins only.");
        }
    }

    private boolean isStaff(User user) {
        String role = user.getRole();
        return "ADMIN".equalsIgnoreCase(role)
                || "SUPPORT_ASSISTANT".equalsIgnoreCase(role)
                || "DELIVERY_OPERATOR".equalsIgnoreCase(role);
    }

    private String sha256(String data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(hash.length * 2);
            for (byte b : hash) {
                sb.append(HEX.charAt((b >> 4) & 0xF)).append(HEX.charAt(b & 0xF));
            }
            return sb.toString();
        } catch (Exception e) {
            log.error("Failed to hash signature data", e);
            throw new IllegalStateException("Could not hash signature data.");
        }
    }

    @Transactional
    public ProofOfDeliveryResponse create(Long shipmentId, ProofOfDeliveryRequest request, String currentUserEmail) {
        User currentUser = getUserByEmail(currentUserEmail);
        requireDeliveryOperator(currentUser);

        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found."));

        String signatureData = request.getSignatureData().trim();
        String itemImageData = request.getItemImageData() != null ? request.getItemImageData().trim() : null;
        String method = request.getMethod() != null ? request.getMethod().toUpperCase() : "DIGITAL";
        if (!"DIGITAL".equals(method) && !"PHYSICAL".equals(method)) {
            throw new IllegalArgumentException("Method must be DIGITAL or PHYSICAL.");
        }

        LocalDateTime capturedAt = LocalDateTime.now();
        ProofOfDelivery pod = podRepository.findByShipmentId(shipmentId).orElse(null);

        if (pod == null) {
            pod = ProofOfDelivery.builder()
                    .shipment(shipment)
                    .recipientName(request.getRecipientName().trim())
                    .signatureData(signatureData)
                    .signatureHash(sha256(signatureData))
                    .itemImageData(itemImageData)
                    .itemImageHash(itemImageData != null ? sha256(itemImageData) : null)
                    .method(method)
                    .notes(request.getNotes())
                    .capturedAt(capturedAt)
                    .capturedBy(currentUser)
                    .verificationStatus("PENDING")
                    .build();

            pod = podRepository.save(pod);
            log.info("Proof of delivery captured for shipment {} by {}", shipmentId, currentUser.getEmail());
        } else if ("VERIFIED".equals(pod.getVerificationStatus())) {
            throw new DuplicateResourceException(
                    "This shipment already has a verified proof of delivery and cannot be re-captured.");
        } else {
            pod.setRecipientName(request.getRecipientName().trim());
            pod.setSignatureData(signatureData);
            pod.setSignatureHash(sha256(signatureData));
            pod.setItemImageData(itemImageData);
            pod.setItemImageHash(itemImageData != null ? sha256(itemImageData) : null);
            pod.setMethod(method);
            pod.setNotes(request.getNotes());
            pod.setCapturedAt(capturedAt);
            pod.setCapturedBy(currentUser);
            pod.setVerificationStatus("PENDING");
            pod.setVerifiedBy(null);
            pod.setVerifiedAt(null);
            pod.setVerificationNotes(null);

            pod = podRepository.save(pod);
            removeStaleDeliveryEvents(shipmentId);
            log.info("Proof of delivery {} re-captured for shipment {} by {}", pod.getId(), shipmentId, currentUser.getEmail());
        }

        if (!"DELIVERED".equals(shipment.getStatus())) {
            shipment.setStatus("DELIVERED");
        }
        if (shipment.getActualDeliveryTime() == null) {
            shipment.setActualDeliveryTime(pod.getCapturedAt());
        }
        shipmentRepository.save(shipment);

        TrackingEvent deliveryEvent = TrackingEvent.builder()
                .shipment(shipment)
                .status("DELIVERED")
                .build();
        trackingEventRepository.save(deliveryEvent);
        log.info("Shipment {} marked DELIVERED upon proof of delivery capture", shipmentId);

        return toResponse(pod);
    }

    private void removeStaleDeliveryEvents(Long shipmentId) {
        List<TrackingEvent> stale = trackingEventRepository.findByShipmentIdOrderByRecordedAtAsc(shipmentId)
                .stream()
                .filter(e -> "DELIVERED".equals(e.getStatus()) && e.getLatitude() == null && e.getLongitude() == null)
                .collect(Collectors.toList());
        if (!stale.isEmpty()) {
            trackingEventRepository.deleteAll(stale);
        }
    }

    @Transactional(readOnly = true)
    public ProofOfDeliveryResponse getByShipment(Long shipmentId, String currentUserEmail) {
        User currentUser = getUserByEmail(currentUserEmail);

        ProofOfDelivery pod = podRepository.findByShipmentId(shipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("No proof of delivery for this shipment."));

        Shipment shipment = pod.getShipment();
        boolean isOwner = shipment.getCreatedBy() != null
                && shipment.getCreatedBy().getId().equals(currentUser.getId());

        boolean isStaffMember = isStaff(currentUser);

        if (!isOwner && !isStaffMember && !"DELIVERED".equals(shipment.getStatus())) {
            throw new ForbiddenException("You do not have access to this shipment.");
        }

        return toResponse(pod);
    }

    @Transactional(readOnly = true)
    public List<ProofOfDeliveryResponse> getAll(String currentUserEmail) {
        User currentUser = getUserByEmail(currentUserEmail);
        String role = currentUser.getRole();
        if (!"ADMIN".equalsIgnoreCase(role) && !"SUPPORT_ASSISTANT".equalsIgnoreCase(role)) {
            throw new ForbiddenException("Access denied. Admins or Support only.");
        }

        return podRepository.findAllByOrderByCapturedAtDesc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProofOfDeliveryResponse verify(Long podId, ProofOfDeliveryVerifyRequest request, String currentUserEmail) {
        User currentUser = getUserByEmail(currentUserEmail);
        requireAdmin(currentUser);

        ProofOfDelivery pod = podRepository.findById(podId)
                .orElseThrow(() -> new ResourceNotFoundException("Proof of delivery not found."));

        String decision = request.getDecision().toUpperCase();
        if (!"VERIFIED".equals(decision) && !"REJECTED".equals(decision)) {
            throw new IllegalArgumentException("Decision must be VERIFIED or REJECTED.");
        }

        boolean signatureIntact = pod.getSignatureHash() != null
                && pod.getSignatureData() != null
                && pod.getSignatureHash().equals(sha256(pod.getSignatureData()));

        if ("VERIFIED".equals(decision) && !signatureIntact) {
            throw new IllegalStateException(
                    "Cannot verify this proof of delivery: the captured signature failed its integrity check.");
        }

        pod.setVerificationStatus(decision);
        pod.setVerifiedBy(currentUser);
        pod.setVerifiedAt(LocalDateTime.now());
        pod.setVerificationNotes(request.getNotes());

        pod = podRepository.save(pod);
        log.info("Proof of delivery {} marked {} by {}", podId, decision, currentUser.getEmail());

        return toResponse(pod);
    }

    private ProofOfDeliveryResponse toResponse(ProofOfDelivery pod) {
        String storedHash = pod.getSignatureHash();
        String signatureData = pod.getSignatureData();
        boolean intact = storedHash != null
                && signatureData != null
                && storedHash.equals(sha256(signatureData));

        String storedImageHash = pod.getItemImageHash();
        String itemImageData = pod.getItemImageData();
        Boolean imageIntact = itemImageData != null
                ? storedImageHash != null && storedImageHash.equals(sha256(itemImageData))
                : null;

        String verifiedByName = null;
        if (pod.getVerifiedBy() != null) {
            try {
                verifiedByName = pod.getVerifiedBy().getName();
            } catch (Exception e) {
                log.warn("Failed to resolve verifier name for POD {}", pod.getId(), e);
            }
        }

        String capturedByName = null;
        if (pod.getCapturedBy() != null) {
            try {
                capturedByName = pod.getCapturedBy().getName();
            } catch (Exception e) {
                log.warn("Failed to resolve capturer name for POD {}", pod.getId(), e);
            }
        }

        Shipment shipment = pod.getShipment();
        return ProofOfDeliveryResponse.builder()
                .id(pod.getId())
                .shipmentId(shipment.getId())
                .trackingNumber(shipment.getTrackingNumber())
                .recipientName(pod.getRecipientName())
                .signatureData(pod.getSignatureData())
                .signatureHash(pod.getSignatureHash())
                .itemImageData(pod.getItemImageData())
                .itemImageHash(pod.getItemImageHash())
                .method(pod.getMethod())
                .notes(pod.getNotes())
                .capturedAt(pod.getCapturedAt())
                .capturedByName(capturedByName)
                .verificationStatus(pod.getVerificationStatus())
                .verifiedByName(verifiedByName)
                .verifiedAt(pod.getVerifiedAt())
                .verificationNotes(pod.getVerificationNotes())
                .deliveredAt(shipment.getActualDeliveryTime())
                .signatureIntact(intact)
                .itemImageIntact(imageIntact)
                .build();
    }
}
