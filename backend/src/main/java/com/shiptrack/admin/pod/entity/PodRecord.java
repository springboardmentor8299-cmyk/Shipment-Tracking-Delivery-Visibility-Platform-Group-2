package com.shiptrack.admin.pod.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.shiptrack.admin.shipment.entity.Shipment;

import jakarta.persistence.*;
import lombok.*;

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

    private String signatureUrl;

    @Builder.Default
    @ElementCollection
    @CollectionTable(name = "pod_photo_urls", joinColumns = @JoinColumn(name = "pod_id"))
    @OrderColumn(name = "photo_order")
    @Column(name = "photo_url")
    private List<String> photoUrls = new ArrayList<>();

    @Column(nullable = false)
    private LocalDateTime deliveredAt;

    private String deliveredBy;

    @PrePersist
    public void prePersist() {
        if (deliveredAt == null) {
            deliveredAt = LocalDateTime.now();
        }
    }

}
