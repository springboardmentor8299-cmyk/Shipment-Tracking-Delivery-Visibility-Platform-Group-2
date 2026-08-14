package com.shiptrack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupportMessageResponse {

    private Long id;
    private Long senderId;
    private String senderName;
    private String senderEmail;
    private String senderRole;
    private String content;
    private LocalDateTime sentAt;
}
