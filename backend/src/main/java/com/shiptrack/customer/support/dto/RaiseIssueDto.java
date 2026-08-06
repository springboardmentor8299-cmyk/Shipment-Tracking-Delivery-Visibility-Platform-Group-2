package com.shiptrack.customer.support.dto;

import org.springframework.web.multipart.MultipartFile;

import com.shiptrack.customer.support.entity.IssueType;

import lombok.Data;

@Data
public class RaiseIssueDto {

    private String trackingId;

    private String subject;

    private String description;

    private IssueType issueType;

    private MultipartFile attachment;

}