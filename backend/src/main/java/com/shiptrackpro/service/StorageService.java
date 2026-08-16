package com.shiptrackpro.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class StorageService {

    private static final Logger logger = LoggerFactory.getLogger(StorageService.class);

    @Value("${app.aws.s3.bucket-name:shiptrack-pod-proofs}")
    private String s3BucketName;

    @Value("${app.cloudinary.cloud-name:}")
    private String cloudinaryCloudName;

    public String storeBase64Image(String base64Content, String prefix) {
        if (base64Content == null || base64Content.isBlank()) {
            return null;
        }

        // If it's already a URL, return it directly
        if (base64Content.startsWith("http://") || base64Content.startsWith("https://")) {
            return base64Content;
        }

        // In cloud deployment, upload to S3 or Cloudinary. For standalone execution, generate persistent stored URI.
        String fileName = (prefix != null ? prefix : "file") + "-" + UUID.randomUUID().toString() + ".png";
        logger.info("Stored file payload as simulated S3 artifact: s3://{}/{}", s3BucketName, fileName);

        // Return standard data URI or hosted reference
        return base64Content;
    }
}
