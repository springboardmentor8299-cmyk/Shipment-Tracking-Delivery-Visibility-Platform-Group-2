package com.shiptrack.backend.service;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

import com.shiptrack.backend.entity.Shipment;
import com.shiptrack.backend.repository.ShipmentRepository;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ReportService {

    private final ShipmentRepository shipmentRepository;

    public ReportService(ShipmentRepository shipmentRepository) {
        this.shipmentRepository = shipmentRepository;
    }

    public byte[] generatePdfReport(String type) throws Exception {
        List<Shipment> shipments = shipmentRepository.findAll();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, out);
        document.open();

        // Title
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
        Paragraph title = new Paragraph("ShipTrack Pro — " + type.toUpperCase() + " REPORT", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);

        Paragraph timestamp = new Paragraph("Generated at: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")),
                FontFactory.getFont(FontFactory.HELVETICA, 10));
        timestamp.setAlignment(Element.ALIGN_CENTER);
        timestamp.setSpacingAfter(20);
        document.add(timestamp);

        // Table
        PdfPTable table = new PdfPTable(6);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{1.5f, 2f, 2f, 3f, 3f, 2f});

        String[] headers = {"ID", "Tracking #", "Sender", "Pickup Address", "Delivery Address", "Status"};
        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, headerFont));
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setBackgroundColor(Color.LIGHT_GRAY);
            table.addCell(cell);
        }

        Font dataFont = FontFactory.getFont(FontFactory.HELVETICA, 9);
        for (Shipment s : shipments) {
            table.addCell(new Phrase(String.valueOf(s.getId()), dataFont));
            table.addCell(new Phrase(s.getTrackingNumber() != null ? s.getTrackingNumber() : "", dataFont));
            table.addCell(new Phrase(s.getSenderName() != null ? s.getSenderName() : "", dataFont));
            table.addCell(new Phrase(s.getPickupAddress() != null ? s.getPickupAddress() : "", dataFont));
            table.addCell(new Phrase(s.getDeliveryAddress() != null ? s.getDeliveryAddress() : "", dataFont));
            table.addCell(new Phrase(s.getStatus() != null ? s.getStatus() : "", dataFont));
        }

        document.add(table);
        document.close();

        return out.toByteArray();
    }

    public byte[] generateExcelReport(String type) throws Exception {
        List<Shipment> shipments = shipmentRepository.findAll();

        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet(type.toUpperCase() + " Report");

        // Header style
        org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        CellStyle headerStyle = workbook.createCellStyle();
        headerStyle.setFont(headerFont);

        // Create Header Row
        org.apache.poi.ss.usermodel.Row headerRow = sheet.createRow(0);
        String[] headers = {"ID", "Tracking Number", "Sender Name", "Receiver Name", "Pickup Address", "Delivery Address", "Current Lat", "Current Lng", "Status"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // Fill Data Rows
        int rowIdx = 1;
        for (Shipment s : shipments) {
            org.apache.poi.ss.usermodel.Row row = sheet.createRow(rowIdx++);
            row.createCell(0).setCellValue(s.getId() != null ? s.getId() : 0);
            row.createCell(1).setCellValue(s.getTrackingNumber() != null ? s.getTrackingNumber() : "");
            row.createCell(2).setCellValue(s.getSenderName() != null ? s.getSenderName() : "");
            row.createCell(3).setCellValue(s.getReceiverName() != null ? s.getReceiverName() : "");
            row.createCell(4).setCellValue(s.getPickupAddress() != null ? s.getPickupAddress() : "");
            row.createCell(5).setCellValue(s.getDeliveryAddress() != null ? s.getDeliveryAddress() : "");
            row.createCell(6).setCellValue(s.getLatitude() != null ? s.getLatitude() : 0.0);
            row.createCell(7).setCellValue(s.getLongitude() != null ? s.getLongitude() : 0.0);
            row.createCell(8).setCellValue(s.getStatus() != null ? s.getStatus() : "");
        }

        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        workbook.write(out);
        workbook.close();

        return out.toByteArray();
    }
}
