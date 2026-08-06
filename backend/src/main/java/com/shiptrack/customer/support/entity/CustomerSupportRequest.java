package com.shiptrack.customer.support.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.shiptrack.admin.shipment.entity.Shipment;
import com.shiptrack.auth.entity.User;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "customer_support_request")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerSupportRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Logged in Customer
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    // Optional
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipment_id")
    private Shipment shipment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestType requestType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private RequestStatus status = RequestStatus.PENDING;

    // Shipment Request Fields
    private String senderName;

    private String receiverName;

    @Column(columnDefinition = "TEXT")
    private String pickupAddress;

    @Column(columnDefinition = "TEXT")
    private String deliveryAddress;

    private String packageType;

    private BigDecimal weight;

    private LocalDate pickupDate;

    @Column(columnDefinition = "TEXT")
    private String specialInstructions;

    // Issue Fields
    @Enumerated(EnumType.STRING)
    private IssueType issueType;

    private String subject;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String attachment;

    // Assigned Support Agent
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private User assignedTo;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

}