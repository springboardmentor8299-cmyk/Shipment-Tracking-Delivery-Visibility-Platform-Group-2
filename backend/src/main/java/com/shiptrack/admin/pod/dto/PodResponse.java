package com.shiptrack.admin.pod.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class PodResponse {

    private Long id;
    private String trackingId;
    private String customerName;
    private String receiverName;
    private String deliveryNotes;
    private String verificationMethod;
    private String verificationCode;
    private Map<String, Boolean> verificationChecklist;
    private String signatureUrl;
    private List<String> photoUrls;
    private LocalDateTime deliveredAt;
    private String deliveredBy;

}
