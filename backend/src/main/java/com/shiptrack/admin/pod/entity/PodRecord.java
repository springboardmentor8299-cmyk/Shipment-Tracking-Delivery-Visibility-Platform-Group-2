package com.shiptrack.admin.pod.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.shiptrack.admin.shipment.entity.Shipment;

import jakarta.persistence.*;
import lombok.*;

// (v) POD record management (vi) Delivery evidence storage
// One row per delivery confirmation. Evidence files (signature + photos)
// are stored on disk by FileStorageService; only their served URLs live here.
@Entity
@Table(name = "pod_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PodRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "shipment_id", nullable = false)
    private Shipment shipment;

    @Column(nullable = false)
    private String receiverName;

    @Column(length = 2000)
    private String deliveryNotes;

    // (iv) Verification workflows
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VerificationMethod verificationMethod;

    private String verificationCode;

    @Builder.Default
    @ElementCollection
    @CollectionTable(name = "pod_checklist_items", joinColumns = @JoinColumn(name = "pod_id"))
    @MapKeyColumn(name = "item_key")
    @Column(name = "item_value")
    private Map<String, Boolean> verificationChecklist = new LinkedHashMap<>();

    // (i) Digital signature capture — URL of the stored signature image
    private String signatureUrl;

    // (ii) Delivery photo upload — URLs of stored evidence photos
    @Builder.Default
    @ElementCollection
    @CollectionTable(name = "pod_photo_urls", joinColumns = @JoinColumn(name = "pod_id"))
    @OrderColumn(name = "photo_order")
    @Column(name = "photo_url")
    private List<String> photoUrls = new ArrayList<>();

    @Column(nullable = false)
    private LocalDateTime deliveredAt;

    // Username of the staff member who captured this POD
    private String deliveredBy;

    @PrePersist
    public void prePersist() {
        if (deliveredAt == null) {
            deliveredAt = LocalDateTime.now();
        }
    }

}
