package com.shiptrack.admin.pod.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.shiptrack.admin.pod.dto.PodResponse;
import com.shiptrack.admin.pod.dto.PodSubmitRequest;
import com.shiptrack.admin.pod.service.PodService;

@RestController
@RequestMapping("/api/admin/pod")
public class PodController {

    private final PodService podService;

    public PodController(PodService podService) {
        this.podService = podService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PodResponse> submitPod(
            @RequestParam String trackingId,
            @RequestParam String receiverName,
            @RequestParam(required = false) String deliveryNotes,
            @RequestParam String verificationMethod,
            @RequestParam(required = false) String verificationCode,
            @RequestParam(required = false) String verificationChecklist,
            @RequestParam(required = false) MultipartFile signature,
            @RequestParam(required = false) MultipartFile[] photos,
            Authentication authentication) {

        PodSubmitRequest request = new PodSubmitRequest();
        request.setTrackingId(trackingId);
        request.setReceiverName(receiverName);
        request.setDeliveryNotes(deliveryNotes);
        request.setVerificationMethod(verificationMethod);
        request.setVerificationCode(verificationCode);
        request.setVerificationChecklist(verificationChecklist);
        request.setSignature(signature);
        request.setPhotos(photos);

        String submittedBy = authentication != null ? authentication.getName() : "unknown";

        return ResponseEntity.ok(podService.submitPod(request, submittedBy));
    }

    @GetMapping
    public List<PodResponse> getAllPods() {
        return podService.getAllPods();
    }

    @GetMapping("/{trackingId}")
    public PodResponse getPodByTrackingId(@PathVariable String trackingId) {
        return podService.getLatestPodForTrackingId(trackingId);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePod(@PathVariable Long id) {
        podService.deletePod(id);
        return ResponseEntity.noContent().build();
    }

}
