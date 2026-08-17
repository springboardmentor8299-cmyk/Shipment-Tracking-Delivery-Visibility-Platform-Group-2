import jsPDF from 'jspdf';
import { Shipment } from '../types';

export const loadImageAsDataUrl = (url: string): Promise<string | null> => {
  return new Promise((resolve) => {
    if (!url) return resolve(null);
    if (url.startsWith('data:image/png') || url.startsWith('data:image/jpeg')) {
      return resolve(url);
    }
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width || 400;
        canvas.height = img.naturalHeight || img.height || 300;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        } else {
          resolve(null);
        }
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
};

export const convertSvgDataUrlToPng = (svgDataUrl: string): Promise<string | null> => {
  return new Promise((resolve) => {
    if (!svgDataUrl) return resolve(null);
    if (svgDataUrl.startsWith('data:image/png') || svgDataUrl.startsWith('data:image/jpeg')) {
      return resolve(svgDataUrl);
    }
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, 300, 100);
          resolve(canvas.toDataURL('image/png'));
        } else {
          resolve(null);
        }
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = svgDataUrl.startsWith('data:image/svg+xml') 
      ? svgDataUrl 
      : `data:image/svg+xml;utf8,${encodeURIComponent(svgDataUrl)}`;
  });
};

export async function generatePodPdf(shipment: Shipment) {
  const doc = new jsPDF();
  const pod = shipment.proofOfDelivery;

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 32, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('SHIPTRACK LOGISTICS PRO', 14, 15);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Official Package Receipt & Proof of Delivery (POD)', 14, 23);

  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 140, 15);
  doc.text(`Doc ID: ${pod?.verificationCode || 'POD-REC-' + shipment.trackingNumber}`, 140, 23);

  // Status & Tracking Bar
  let currentY = 42;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Package Tracking Number: ${shipment.trackingNumber}`, 14, currentY);

  currentY += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Delivery Status: ${shipment.status.toUpperCase()}`, 14, currentY);
  if (pod?.verificationStatus) {
    doc.text(`Verification Status: ${pod.verificationStatus}`, 110, currentY);
  }

  // Section 1: Package Specifications
  currentY += 10;
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(14, currentY, 182, 34, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Package Specifications', 18, currentY + 7);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Package Type: ${shipment.packageType || 'Standard Package'}`, 18, currentY + 15);
  doc.text(`Weight: ${shipment.weightKg} kg`, 18, currentY + 22);
  doc.text(`Dimensions: ${shipment.dimensionsCm || 'N/A'}`, 18, currentY + 29);

  doc.text(`Priority Level: ${shipment.priority}`, 108, currentY + 15);
  doc.text(`Declared Value: $${shipment.declaredValueUsd || 0}`, 108, currentY + 22);
  doc.text(`Created Date: ${shipment.createdAt || 'N/A'}`, 108, currentY + 29);

  // Section 2: Sender & Receiver Details
  currentY += 40;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, currentY, 88, 38, 'F');
  doc.rect(108, currentY, 88, 38, 'F');

  // Sender
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Sender Details', 18, currentY + 8);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${shipment.senderName}`, 18, currentY + 16);
  const senderAddr = shipment.senderAddress.address ? `${shipment.senderAddress.address}, ${shipment.senderAddress.city}` : `${shipment.senderAddress.city}, ${shipment.senderAddress.country}`;
  doc.text(`Address: ${senderAddr}`, 18, currentY + 23);
  doc.text(`State/Country: ${shipment.senderAddress.state || ''} ${shipment.senderAddress.country}`, 18, currentY + 30);

  // Recipient
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Recipient & Delivery Address', 112, currentY + 8);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${pod?.recipientName || shipment.receiverName}`, 112, currentY + 16);
  const receiverAddr = shipment.receiverAddress.address ? `${shipment.receiverAddress.address}, ${shipment.receiverAddress.city}` : `${shipment.receiverAddress.city}, ${shipment.receiverAddress.country}`;
  doc.text(`Address: ${receiverAddr}`, 112, currentY + 23);
  doc.text(`Delivered Time: ${pod?.deliveredAt || pod?.timestamp || shipment.estimatedDeliveryTime}`, 112, currentY + 30);

  // Carrier / Driver Info
  currentY += 44;
  if (shipment.driver) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`Assigned Carrier Driver: ${shipment.driver.name} | Vehicle: ${shipment.driver.vehicle} (${shipment.driver.licensePlate || 'Fleet Van'})`, 14, currentY);
    currentY += 8;
  }

  // Section 3: Proof of Delivery Evidence (Signature & Photo)
  if (pod) {
    doc.setLineWidth(0.5);
    doc.setDrawColor(203, 213, 225);
    doc.line(14, currentY, 196, currentY);
    currentY += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Proof of Delivery (POD) Evidence', 14, currentY);
    currentY += 6;

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Verification Code: ${pod.verificationCode}`, 14, currentY + 2);
    if (pod.latitude && pod.longitude) {
      doc.text(`GPS Geotag Coordinates: Lat ${pod.latitude}, Lng ${pod.longitude}`, 108, currentY + 2);
    }
    if (pod.notes) {
      doc.text(`Delivery Handover Notes: ${pod.notes}`, 14, currentY + 8);
      currentY += 6;
    }
    currentY += 10;

    // Load Signature and Photo Images asynchronously
    const sigUrl = pod.signatureImageUrl || pod.signatureDataUrl;
    const photoUrl = pod.deliveryPhotoUrl || pod.photoUrl;

    const [sigData, photoData] = await Promise.all([
      sigUrl ? convertSvgDataUrlToPng(sigUrl) : Promise.resolve(null),
      photoUrl ? loadImageAsDataUrl(photoUrl) : Promise.resolve(null)
    ]);

    // Box for Signature Image
    doc.setFillColor(248, 250, 252);
    doc.rect(14, currentY, 88, 48, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(14, currentY, 88, 48, 'S');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 65, 85);
    doc.text('Recipient Digital Signature', 18, currentY + 7);

    if (sigData) {
      try {
        doc.addImage(sigData, 'PNG', 18, currentY + 10, 80, 32);
      } catch {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('[Digital Signature Attached]', 18, currentY + 25);
      }
    } else {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('[Signature Captured Digitally]', 18, currentY + 25);
    }

    // Box for Photo Evidence
    doc.setFillColor(248, 250, 252);
    doc.rect(108, currentY, 88, 48, 'F');
    doc.rect(108, currentY, 88, 48, 'S');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 65, 85);
    doc.text('Doorstep Photo Evidence', 112, currentY + 7);

    if (photoData) {
      try {
        doc.addImage(photoData, 'JPEG', 112, currentY + 10, 80, 34);
      } catch {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('[Doorstep Photo Evidence Attached]', 112, currentY + 25);
      }
    } else {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('[Photo Captured at Handover]', 112, currentY + 25);
    }
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('This PDF document is an official delivery verification record generated by ShipTrack Logistics system.', 14, 285);

  doc.save(`Package_POD_Receipt_${shipment.trackingNumber}.pdf`);
}
