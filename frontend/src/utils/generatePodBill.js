import { jsPDF } from "jspdf";

// Generates a one-click "delivery bill" PDF for a POD record — sender,
// receiver, shipment details, cost, and the captured evidence (signature +
// photos) — and triggers a download. Used from the Proof of Delivery
// records table.

// Uploaded evidence is served over CORS (see backend CorsConfig), so a
// plain fetch + FileReader round trip gets us a data URL jsPDF can embed,
// without ever touching a <canvas> (which would otherwise risk tainting
// on a cross-origin image).
async function loadImageAsDataUrl(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}`);
  const blob = await response.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function dataUrlFormat(dataUrl) {
  const match = /^data:image\/(\w+);/.exec(dataUrl);
  return match ? match[1].toUpperCase() : "PNG";
}

function loadImageSize(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });
}

const PAGE_WIDTH = 210; // A4, mm
const MARGIN = 16;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const FOOTER_Y = 288;

export async function generatePodBillPdf(record) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = MARGIN;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(37, 99, 235);
  doc.text("ShipTrack", MARGIN, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  doc.text("Delivery Bill / Proof of Delivery Receipt", MARGIN, y + 6);

  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleString()}`, PAGE_WIDTH - MARGIN, y, {
    align: "right",
  });

  y += 14;
  doc.setDrawColor(226, 232, 240);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(record.trackingId || "—", MARGIN, y);
  y += 9;

  const rows = [
    ["Sender", record.customerName],
    ["Receiver", record.receiverName],
    ["Origin", record.origin],
    ["Destination", record.destination],
    ["No. of Items", record.noOfItems],
    ["Total Weight", record.totalWeightOfItems],
    ["Shipment Cost", record.shipmentCost],
    ["Verification Method", record.verificationMethod],
    [
      "Delivered At",
      record.deliveredAt ? new Date(record.deliveredAt).toLocaleString() : null,
    ],
    ["Delivered By", record.deliveredBy],
  ];
  if (record.deliveryNotes) rows.push(["Delivery Notes", record.deliveryNotes]);

  const labelWidth = 45;
  doc.setFontSize(10.5);
  rows.forEach(([label, value]) => {
    if (y > FOOTER_Y - 15) {
      doc.addPage();
      y = MARGIN;
    }
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.text(label, MARGIN, y);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    const valueLines = doc.splitTextToSize(String(value || "—"), CONTENT_WIDTH - labelWidth);
    doc.text(valueLines, MARGIN + labelWidth, y);
    y += 6 * valueLines.length + 1.5;
  });

  y += 4;

  // Signature
  if (record.signatureUrl) {
    if (y > FOOTER_Y - 45) {
      doc.addPage();
      y = MARGIN;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("Receiver Signature", MARGIN, y);
    y += 4;

    try {
      const dataUrl = await loadImageAsDataUrl(record.signatureUrl);
      const size = await loadImageSize(dataUrl);
      const w = 60;
      const h = size ? (size.height / size.width) * w : 30;
      doc.setDrawColor(226, 232, 240);
      doc.rect(MARGIN, y, w + 6, h + 6);
      doc.addImage(dataUrl, dataUrlFormat(dataUrl), MARGIN + 3, y + 3, w, h);
      y += h + 12;
    } catch (err) {
      console.error("Could not embed signature in bill PDF:", err);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9.5);
      doc.setTextColor(148, 163, 184);
      doc.text("Signature image could not be loaded.", MARGIN, y + 5);
      y += 12;
    }
  }

  // Evidence photos
  if (record.photoUrls?.length) {
    if (y > FOOTER_Y - 55) {
      doc.addPage();
      y = MARGIN;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("Proof of Delivery Photos", MARGIN, y);
    y += 4;

    const thumbSize = 45;
    const gap = 6;
    let x = MARGIN;
    let rowHeight = 0;

    for (const url of record.photoUrls) {
      if (x + thumbSize > PAGE_WIDTH - MARGIN) {
        x = MARGIN;
        y += rowHeight + gap;
        rowHeight = 0;
      }
      if (y + thumbSize > FOOTER_Y - 5) {
        doc.addPage();
        y = MARGIN;
        x = MARGIN;
        rowHeight = 0;
      }

      try {
        const dataUrl = await loadImageAsDataUrl(url);
        doc.setDrawColor(226, 232, 240);
        doc.rect(x, y, thumbSize, thumbSize);
        doc.addImage(dataUrl, dataUrlFormat(dataUrl), x + 1, y + 1, thumbSize - 2, thumbSize - 2);
      } catch (err) {
        console.error("Could not embed photo in bill PDF:", url, err);
        doc.setDrawColor(226, 232, 240);
        doc.rect(x, y, thumbSize, thumbSize);
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text("Image unavailable", x + 3, y + thumbSize / 2, {
          maxWidth: thumbSize - 6,
        });
      }

      x += thumbSize + gap;
      rowHeight = thumbSize;
    }
    y += rowHeight + 10;
  }

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      "This bill was generated by ShipTrack from the proof-of-delivery record on file.",
      MARGIN,
      FOOTER_Y + 2,
    );
    doc.text(`Page ${i} of ${pageCount}`, PAGE_WIDTH - MARGIN, FOOTER_Y + 2, {
      align: "right",
    });
  }

  doc.save(`Bill-${record.trackingId || record.id}.pdf`);
}
