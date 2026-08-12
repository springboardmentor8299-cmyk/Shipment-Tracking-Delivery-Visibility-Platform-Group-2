package com.shiptrack.impl;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Image;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.shiptrack.dto.PodUploadRequest;
import com.shiptrack.dto.ProofOfDeliveryResponse;
import com.shiptrack.entity.ProofOfDelivery;
import com.shiptrack.entity.Shipment;
import com.shiptrack.entity.User;
import com.shiptrack.repository.ProofOfDeliveryRepository;
import com.shiptrack.repository.ShipmentRepository;
import com.shiptrack.repository.UserRepository;
import com.shiptrack.service.ProofOfDeliveryService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;

@Service
public class ProofOfDeliveryServiceImpl implements ProofOfDeliveryService {

    private static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ofPattern("dd MMM yyyy");
    private static final DateTimeFormatter TIME_FORMAT =
            DateTimeFormatter.ofPattern("hh:mm a");

    private final ProofOfDeliveryRepository proofOfDeliveryRepository;
    private final ShipmentRepository shipmentRepository;
    private final UserRepository userRepository;

    public ProofOfDeliveryServiceImpl(
            ProofOfDeliveryRepository proofOfDeliveryRepository,
            ShipmentRepository shipmentRepository,
            UserRepository userRepository) {

        this.proofOfDeliveryRepository = proofOfDeliveryRepository;
        this.shipmentRepository = shipmentRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public ProofOfDeliveryResponse upload(PodUploadRequest request) {

        if (request.getShipmentId() == null) {
            throw new RuntimeException("Shipment id is required.");
        }
        if (request.getReceiverName() == null || request.getReceiverName().isBlank()) {
            throw new RuntimeException("Receiver name is required.");
        }

        Shipment shipment = shipmentRepository.findById(request.getShipmentId())
                .orElseThrow(() -> new RuntimeException("Shipment not found."));

        ProofOfDelivery pod = proofOfDeliveryRepository
                .findByShipmentId(shipment.getId())
                .orElse(new ProofOfDelivery());

        pod.setShipment(shipment);
        pod.setReceiverName(request.getReceiverName().trim());
        pod.setDeliveryTime(request.getDeliveryTime() != null
                ? request.getDeliveryTime()
                : LocalDateTime.now());

        String driverName = request.getDriverName();
        User currentUser = getCurrentUser();
        if (currentUser != null && currentUser.getRole() != null
                && "ROLE_DRIVER".equals(currentUser.getRole().getName())) {
            driverName = currentUser.getFullName();
        }
        pod.setDriverName(driverName);

        pod.setLatitude(request.getLatitude());
        pod.setLongitude(request.getLongitude());
        pod.setSignatureData(request.getSignatureData());
        pod.setDeliveryPhoto(request.getDeliveryPhoto());
        pod.setRemarks(request.getRemarks());

        return toResponse(proofOfDeliveryRepository.save(pod));
    }

    @Override
    @Transactional(readOnly = true)
    public ProofOfDeliveryResponse getByShipmentId(Long shipmentId) {

        ProofOfDelivery pod = proofOfDeliveryRepository.findByShipmentId(shipmentId)
                .orElseThrow(() -> new RuntimeException(
                        "No proof of delivery found for this shipment."));

        return toResponse(pod);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] downloadPdf(Long shipmentId) {

        ProofOfDelivery pod = proofOfDeliveryRepository.findByShipmentId(shipmentId)
                .orElseThrow(() -> new RuntimeException(
                        "No proof of delivery found for this shipment."));

        Shipment shipment = pod.getShipment();

        try {
            Document document = new Document(PageSize.A4, 40, 40, 40, 40);
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            PdfWriter.getInstance(document, outputStream);
            document.open();

            Font titleFont = FontFactory.getFont(
                    FontFactory.HELVETICA_BOLD, 20, Font.BOLD, new Color(13, 110, 253));
            Font subtitleFont = FontFactory.getFont(
                    FontFactory.HELVETICA, 11, Font.NORMAL, Color.GRAY);
            Font sectionFont = FontFactory.getFont(
                    FontFactory.HELVETICA_BOLD, 13, Font.BOLD, new Color(51, 51, 51));
            Font labelFont = FontFactory.getFont(
                    FontFactory.HELVETICA_BOLD, 10, Font.BOLD, new Color(90, 90, 90));
            Font valueFont = FontFactory.getFont(
                    FontFactory.HELVETICA, 11, Font.NORMAL, new Color(30, 30, 30));
            Font footerFont = FontFactory.getFont(
                    FontFactory.HELVETICA, 9, Font.NORMAL, Color.GRAY);

            Paragraph title = new Paragraph("PROOF OF DELIVERY", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            Paragraph company = new Paragraph(
                    "ShipTrack — Official Delivery Document", subtitleFont);
            company.setAlignment(Element.ALIGN_CENTER);
            document.add(company);

            Paragraph generated = new Paragraph(
                    "Generated on " + LocalDateTime.now().format(DATE_FORMAT)
                            + " at " + LocalDateTime.now().format(TIME_FORMAT),
                    subtitleFont);
            generated.setAlignment(Element.ALIGN_CENTER);
            document.add(generated);

            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            table.setSpacingBefore(16);
            table.setSpacingAfter(8);

            addRow(table, "Tracking Number",
                    shipment.getTrackingNumber(), labelFont, valueFont);
            addRow(table, "Shipment Status", "DELIVERED", labelFont, valueFont);
            addRow(table, "Driver Name",
                    pod.getDriverName() == null ? "--" : pod.getDriverName(),
                    labelFont, valueFont);
            addRow(table, "Customer Name",
                    customerName(shipment), labelFont, valueFont);
            addRow(table, "Receiver Name",
                    pod.getReceiverName(), labelFont, valueFont);
            addRow(table, "Delivery Address",
                    deliveryAddress(shipment), labelFont, valueFont);
            addRow(table, "Delivery Date",
                    pod.getDeliveryTime() == null ? "--"
                            : pod.getDeliveryTime().format(DATE_FORMAT),
                    labelFont, valueFont);
            addRow(table, "Delivery Time",
                    pod.getDeliveryTime() == null ? "--"
                            : pod.getDeliveryTime().format(TIME_FORMAT),
                    labelFont, valueFont);

            document.add(table);

            addImageSection(document, "Digital Signature",
                    pod.getSignatureData(), sectionFont, labelFont);

            addImageSection(document, "Delivery Photo",
                    pod.getDeliveryPhoto(), sectionFont, labelFont);

            if (pod.getRemarks() != null && !pod.getRemarks().isBlank()) {
                Paragraph remarksTitle = new Paragraph("Delivery Remarks", sectionFont);
                remarksTitle.setSpacingBefore(10);
                document.add(remarksTitle);

                Paragraph remarks = new Paragraph(pod.getRemarks(), valueFont);
                remarks.setSpacingBefore(4);
                document.add(remarks);
            }

            Paragraph footer = new Paragraph(
                    "This is a system-generated Proof of Delivery document. "
                            + "Valid for shipment " + shipment.getTrackingNumber() + ".",
                    footerFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            footer.setSpacingBefore(24);
            document.add(footer);

            document.close();
            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Proof of Delivery PDF.", e);
        }
    }

    private void addRow(PdfPTable table, String label, String value,
                        Font labelFont, Font valueFont) {

        PdfPCell labelCell = new PdfPCell(new Phrase(label, labelFont));
        labelCell.setPadding(6);
        labelCell.setBorderColor(new Color(225, 228, 232));
        labelCell.setBackgroundColor(new Color(244, 246, 248));
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(
                value == null || value.isBlank() ? "--" : value, valueFont));
        valueCell.setPadding(6);
        valueCell.setBorderColor(new Color(225, 228, 232));
        table.addCell(valueCell);
    }

    private void addImageSection(Document document, String title,
                                 String dataUrl, Font sectionFont, Font labelFont) throws Exception {

        byte[] bytes = decodeDataUrl(dataUrl);
        if (bytes == null || bytes.length == 0) {
            return;
        }

        Paragraph sectionTitle = new Paragraph(title, sectionFont);
        sectionTitle.setSpacingBefore(12);
        document.add(sectionTitle);

        Image image = Image.getInstance(bytes);
        image.scaleToFit(360, 200);
        image.setAlignment(Image.ALIGN_LEFT);
        document.add(image);
    }

    private byte[] decodeDataUrl(String dataUrl) {
        if (dataUrl == null || dataUrl.isBlank()) {
            return null;
        }
        int comma = dataUrl.indexOf(',');
        if (comma < 0) {
            return null;
        }
        String base64 = dataUrl.substring(comma + 1).trim();
        try {
            return Base64.getDecoder().decode(base64);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private String customerName(Shipment shipment) {
        if (shipment.getCreatedBy() != null) {
            return shipment.getCreatedBy().getFullName();
        }
        if (shipment.getSenderName() != null && !shipment.getSenderName().isBlank()) {
            return shipment.getSenderName();
        }
        return "--";
    }

    private String deliveryAddress(Shipment shipment) {
        if (shipment.getDestinationAddress() != null && !shipment.getDestinationAddress().isBlank()) {
            return shipment.getDestinationAddress();
        }
        return shipment.getReceiverAddress() == null ? "--" : shipment.getReceiverAddress();
    }

    private ProofOfDeliveryResponse toResponse(ProofOfDelivery pod) {
        ProofOfDeliveryResponse response = new ProofOfDeliveryResponse();
        response.setId(pod.getId());
        response.setShipmentId(pod.getShipment().getId());
        response.setTrackingNumber(pod.getShipment().getTrackingNumber());
        response.setReceiverName(pod.getReceiverName());
        response.setCustomerName(customerName(pod.getShipment()));
        response.setDeliveryAddress(deliveryAddress(pod.getShipment()));
        response.setDeliveryTime(pod.getDeliveryTime());
        response.setDriverName(pod.getDriverName());
        response.setLatitude(pod.getLatitude());
        response.setLongitude(pod.getLongitude());
        response.setSignatureData(pod.getSignatureData());
        response.setDeliveryPhoto(pod.getDeliveryPhoto());
        response.setRemarks(pod.getRemarks());
        response.setCreatedAt(pod.getCreatedAt());
        return response;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            return null;
        }
        return userRepository.findByEmail(authentication.getName()).orElse(null);
    }
}
