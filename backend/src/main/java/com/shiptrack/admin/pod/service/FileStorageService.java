package com.shiptrack.admin.pod.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class FileStorageService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Value("${app.upload.base-url:http://localhost:8080}")
    private String baseUrl;

    public String store(MultipartFile file, String trackingId, String prefix) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        try {
            Path targetDir = Paths.get(uploadDir, "pod", sanitize(trackingId));
            Files.createDirectories(targetDir);

            String extension = extensionOf(file.getOriginalFilename());
            String filename = prefix + "-" + UUID.randomUUID() + extension;
            Path targetPath = targetDir.resolve(filename);

            try (InputStream in = file.getInputStream()) {
                Files.copy(in, targetPath, StandardCopyOption.REPLACE_EXISTING);
            }

            String relativeUrl = "/uploads/pod/" + sanitize(trackingId) + "/" + filename;
            return baseUrl + relativeUrl;
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Could not store uploaded file: " + e.getMessage());
        }
    }

    public void delete(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) {
            return;
        }
        try {
            String relative = fileUrl.replace(baseUrl, "").replaceFirst("^/uploads/", "");
            Path path = Paths.get(uploadDir, relative);
            Files.deleteIfExists(path);
        } catch (IOException ignored) {
        }
    }

    private String extensionOf(String originalFilename) {
        if (originalFilename == null || !originalFilename.contains(".")) {
            return "";
        }
        return originalFilename.substring(originalFilename.lastIndexOf('.'));
    }

    private String sanitize(String trackingId) {
        return trackingId.replaceAll("[^a-zA-Z0-9_-]", "_");
    }

}
