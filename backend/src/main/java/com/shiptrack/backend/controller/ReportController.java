package com.shiptrack.backend.controller;

import com.shiptrack.backend.service.ReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:5173")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    /**
     * GET /api/reports/{type}/export?format=pdf|excel
     * Types: shipment, delivery, route, delay, logistics
     */
    @GetMapping("/{type}/export")
    @PreAuthorize("hasAnyRole('BUSINESS_CLIENT', 'ADMINISTRATOR', 'ADMIN', 'SUPPORT_AGENT')")
    public ResponseEntity<byte[]> exportReport(
            @PathVariable String type,
            @RequestParam(defaultValue = "pdf") String format) {
        try {
            byte[] fileContent;
            String fileName;
            MediaType mediaType;

            if ("excel".equalsIgnoreCase(format) || "xlsx".equalsIgnoreCase(format)) {
                fileContent = reportService.generateExcelReport(type);
                fileName = type + "_report.xlsx";
                mediaType = MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            } else {
                fileContent = reportService.generatePdfReport(type);
                fileName = type + "_report.pdf";
                mediaType = MediaType.APPLICATION_PDF;
            }

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .contentType(mediaType)
                    .body(fileContent);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
