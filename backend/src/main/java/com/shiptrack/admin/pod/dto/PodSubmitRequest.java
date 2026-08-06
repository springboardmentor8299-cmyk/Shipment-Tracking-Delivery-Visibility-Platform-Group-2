package com.shiptrack.admin.pod.dto;

import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PodSubmitRequest {

    @NotBlank(message = "trackingId is required")
    private String trackingId;

    @NotBlank(message = "receiverName is required")
    private String receiverName;

    private String deliveryNotes;

    @NotBlank(message = "verificationMethod is required")
    private String verificationMethod;

    private String verificationCode;

    private String verificationChecklist;

    private MultipartFile signature;

    private MultipartFile[] photos;

}
