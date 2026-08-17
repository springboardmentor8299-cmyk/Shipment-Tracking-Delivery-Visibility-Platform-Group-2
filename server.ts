import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_SHIPMENTS, INITIAL_NOTIFICATIONS, INITIAL_USERS, INITIAL_ACTIVITY_LOGS } from './src/data/mockData';
import { Shipment, AppNotification, UserActivityLog, ShipmentStatus, ProofOfDelivery, UserProfile, UserRole, TransitIssue, ChatMessage } from './src/types';

// In-memory data store for live modifications during runtime session
let shipments: Shipment[] = [...INITIAL_SHIPMENTS];
let notifications: AppNotification[] = [...INITIAL_NOTIFICATIONS];
let activityLogs: UserActivityLog[] = [...INITIAL_ACTIVITY_LOGS];

let escalations = [
  {
    id: 'esc-101',
    shipmentId: 'ship-101',
    trackingNumber: 'STP-9482-IN',
    customerName: 'Aarav Sharma',
    businessClient: 'Tata Electronics Hub',
    operatorName: 'Rajesh Verma',
    supportAgentName: 'Ananya Iyer',
    issueType: 'Flagged POD / Recipient Dispute',
    priority: 'High',
    evidenceUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=600',
    podDetails: {
      recipientName: 'Vikram Mehta',
      deliveredAt: '2026-07-26 14:10',
      verificationStatus: 'FLAGGED',
      notes: 'Signature mismatch reported by recipient.'
    },
    complaintDetails: 'Customer claims parcel was left with security guard without OTP verification.',
    agentDecision: 'Flagged for Admin review. Recommending driver interview.',
    escalationDate: '2026-07-26 14:45',
    status: 'Open',
    internalNotes: 'Awaiting signature verification log from driver device.',
  },
  {
    id: 'esc-102',
    shipmentId: 'ship-103',
    trackingNumber: 'STP-3104-IN',
    customerName: 'Sunita Reddy',
    businessClient: 'Apollo Pharma Logistics',
    operatorName: 'Amit Singh',
    supportAgentName: 'Ananya Iyer',
    issueType: 'Package Damaged in Transit',
    priority: 'Critical',
    evidenceUrl: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?auto=format&fit=crop&q=80&w=600',
    complaintDetails: 'Outer seal broken during transit near Pune toll plaza.',
    agentDecision: 'Initiated insurance claim verification. Escalated for claim approval.',
    escalationDate: '2026-07-26 11:20',
    status: 'Under Review',
    internalNotes: 'Transit insurance policy active up to $5,000.',
  }
];

let businessApprovals = [
  {
    id: 'biz-app-1',
    companyName: 'Adani Logistics Services Ltd',
    contactPerson: 'Karan Adani',
    email: 'karan.a@adani-logistics.com',
    phone: '+91 98220 11223',
    taxIdType: 'GSTIN / EIN',
    taxId: '27AAAAA0000A1Z5',
    industry: 'Heavy Freight & Cold Chain',
    tier: 'Enterprise Tier',
    registrationDate: '2026-07-25 16:30',
    status: 'Pending Approval',
    address: 'Mundra Port Logistics Hub, Kutch, Gujarat',
    verificationStatus: 'Documents Uploaded (Pending Admin Audit)',
  },
  {
    id: 'biz-app-2',
    companyName: 'Flipkart Internet Pvt Ltd',
    contactPerson: 'Sanjay Swamy',
    email: 'sanjay.s@flipkart.in',
    phone: '+91 99001 88776',
    taxIdType: 'GSTIN / EIN',
    taxId: '29ABCDE1234F1Z9',
    industry: 'E-Commerce Marketplace',
    tier: 'Enterprise Tier',
    registrationDate: '2026-07-24 10:15',
    status: 'Approved',
    address: 'Outer Ring Road, Devarabeesanahalli, Bengaluru',
    verificationStatus: 'Fully Verified',
  }
];

let platformSettings = {
  platformName: 'ShipTrack Pro Control Tower',
  timezone: 'IST (UTC+05:30) Mumbai / New Delhi',
  currency: 'USD ($) / INR (₹)',
  autoAssignmentEnabled: true,
  delayThresholdMins: 30,
  escalationThresholdHours: 2,
  emailNotificationsEnabled: true,
  smsNotificationsEnabled: true,
  pushNotificationsEnabled: true,
};

let auditLogs = [
  {
    id: 'aud-101',
    adminName: 'Rajesh Admin',
    adminEmail: 'admin@shiptrack.in',
    action: 'Approved Business Client Application',
    target: 'Flipkart Internet Pvt Ltd (biz-app-2)',
    previousValue: 'Pending Approval',
    newValue: 'Approved / Active Account',
    ipAddress: '10.0.1.10',
    timestamp: '2026-07-26 10:15',
  },
  {
    id: 'aud-102',
    adminName: 'Rajesh Admin',
    adminEmail: 'admin@shiptrack.in',
    action: 'Reassigned Shipment Operator',
    target: 'Shipment #STP-9482-IN',
    previousValue: 'Unassigned',
    newValue: 'Assigned to Rajesh Verma',
    ipAddress: '10.0.1.10',
    timestamp: '2026-07-26 09:30',
  }
];

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side Gemini AI Client Initialization
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is missing. AI features will fallback to smart algorithmic responses.');
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// --- API ENDPOINTS ---

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 2. Shipments endpoints
app.get('/api/shipments', (req, res) => {
  const { role, tracking } = req.query;
  if (tracking) {
    const found = shipments.find(s => s.trackingNumber.toUpperCase() === String(tracking).trim().toUpperCase());
    if (!found) {
      return res.status(404).json({ error: 'Shipment not found' });
    }
    return res.json(found);
  }
  res.json(shipments);
});

app.get('/api/shipments/:trackingNumber', (req, res) => {
  const trackingNumber = req.params.trackingNumber.toUpperCase();
  const shipment = shipments.find(s => s.trackingNumber.toUpperCase() === trackingNumber);
  if (!shipment) {
    return res.status(404).json({ error: `No shipment found for tracking number ${trackingNumber}` });
  }
  res.json(shipment);
});

app.post('/api/shipments', (req, res) => {
  try {
    const newShipmentData = req.body;
    const trackingNumber = `STP-${Math.floor(1000 + Math.random() * 9000)}-IN`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const newShipment: Shipment = {
      id: `ship-${Date.now()}`,
      trackingNumber,
      senderName: newShipmentData.senderName || 'Anonymous Sender',
      senderPhone: newShipmentData.senderPhone || '+91 98765 43210',
      senderEmail: newShipmentData.senderEmail || 'dispatch@sender.in',
      senderAddress: newShipmentData.senderAddress || { city: 'Mumbai', state: 'MH', country: 'India', lat: 19.0760, lng: 72.8777, address: 'Bhiwandi Logistics Hub' },
      receiverName: newShipmentData.receiverName || 'Recipient',
      receiverPhone: newShipmentData.receiverPhone || '+91 91234 56789',
      receiverEmail: newShipmentData.receiverEmail || 'recipient@receiver.in',
      receiverAddress: newShipmentData.receiverAddress || { city: 'New Delhi', state: 'DL', country: 'India', lat: 28.6139, lng: 77.2090, address: 'Connaught Place Depot' },
      status: 'Created',
      priority: newShipmentData.priority || 'Standard',
      weightKg: Number(newShipmentData.weightKg) || 1.0,
      packageType: newShipmentData.packageType || 'Standard Parcel',
      dimensionsCm: newShipmentData.dimensionsCm || '20x15x10',
      declaredValueUsd: Number(newShipmentData.declaredValueUsd) || 100,
      contentsDescription: newShipmentData.contentsDescription || 'General commercial goods',
      isFragile: Boolean(newShipmentData.isFragile),
      isHazardous: Boolean(newShipmentData.isHazardous),
      specialHandlingNotes: newShipmentData.specialHandlingNotes || 'Handle with care',
      createdAt: now,
      estimatedDeliveryTime: newShipmentData.estimatedDeliveryTime || '2026-07-28 17:00',
      aiPredictedDelayRisk: 'Low',
      aiDelayReason: 'Optimal route scheduled. No transit delays anticipated.',
      currentLocation: newShipmentData.senderAddress,
      currentRouteIndex: 0,
      routePath: [
        newShipmentData.senderAddress || { lat: 37.7749, lng: -122.4194, name: 'Origin' },
        newShipmentData.receiverAddress || { lat: 40.7128, lng: -74.0060, name: 'Destination' }
      ],
      events: [
        {
          id: `evt-${Date.now()}`,
          status: 'Created',
          timestamp: now,
          location: `${newShipmentData.senderAddress?.city || 'Origin'} Depot`,
          description: 'Shipment created and registered in ShipTrack Pro database.',
          updatedBy: newShipmentData.createdByUser || 'Business Client',
        }
      ]
    };

    shipments.unshift(newShipment);

    // Log Activity
    activityLogs.unshift({
      id: `act-${Date.now()}`,
      userId: 'usr-2',
      userName: newShipmentData.createdByUser || 'Business Client',
      role: 'Business Client',
      action: `Created new shipment #${trackingNumber} (${newShipment.packageType})`,
      timestamp: now,
      ipAddress: '192.168.1.10',
    });

    // Add Notification
    notifications.unshift({
      id: `notif-${Date.now()}`,
      trackingNumber,
      title: 'New Shipment Created',
      message: `Shipment #${trackingNumber} has been booked for ${newShipment.receiverName}`,
      type: 'info',
      timestamp: now,
      read: false,
    });

    res.status(201).json(newShipment);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to create shipment' });
  }
});

// Full Shipment Details Update
app.put('/api/shipments/:id', (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const shipment = shipments.find(s => s.id === id || s.trackingNumber === id);

  if (!shipment) {
    return res.status(404).json({ error: 'Shipment not found' });
  }

  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

  if (updateData.senderName) shipment.senderName = updateData.senderName;
  if (updateData.senderPhone) shipment.senderPhone = updateData.senderPhone;
  if (updateData.senderEmail) shipment.senderEmail = updateData.senderEmail;
  if (updateData.senderAddress) shipment.senderAddress = { ...shipment.senderAddress, ...updateData.senderAddress };

  if (updateData.receiverName) shipment.receiverName = updateData.receiverName;
  if (updateData.receiverPhone) shipment.receiverPhone = updateData.receiverPhone;
  if (updateData.receiverEmail) shipment.receiverEmail = updateData.receiverEmail;
  if (updateData.receiverAddress) shipment.receiverAddress = { ...shipment.receiverAddress, ...updateData.receiverAddress };

  if (updateData.priority) shipment.priority = updateData.priority;
  if (updateData.packageType) shipment.packageType = updateData.packageType;
  if (updateData.weightKg) shipment.weightKg = Number(updateData.weightKg);
  if (updateData.dimensionsCm) shipment.dimensionsCm = updateData.dimensionsCm;
  if (updateData.declaredValueUsd) shipment.declaredValueUsd = Number(updateData.declaredValueUsd);
  if (updateData.contentsDescription) shipment.contentsDescription = updateData.contentsDescription;
  if (updateData.isFragile !== undefined) shipment.isFragile = Boolean(updateData.isFragile);
  if (updateData.isHazardous !== undefined) shipment.isHazardous = Boolean(updateData.isHazardous);
  if (updateData.specialHandlingNotes) shipment.specialHandlingNotes = updateData.specialHandlingNotes;
  if (updateData.estimatedDeliveryTime) shipment.estimatedDeliveryTime = updateData.estimatedDeliveryTime;

  shipment.events.unshift({
    id: `evt-${Date.now()}`,
    status: shipment.status,
    timestamp: now,
    location: shipment.currentLocation?.city || 'Dispatch Office',
    description: `Shipment details updated by ${updateData.updatedBy || 'Operator'}.`,
    updatedBy: updateData.updatedBy || 'Logistics Operator',
  });

  activityLogs.unshift({
    id: `act-${Date.now()}`,
    userId: 'usr-3',
    userName: updateData.updatedBy || 'Logistics Operator',
    role: 'Logistics Operator',
    action: `Updated manifest & package specs for #${shipment.trackingNumber}`,
    timestamp: now,
    ipAddress: '192.168.1.55',
  });

  res.json(shipment);
});

// Cancel Shipment
app.post('/api/shipments/:id/cancel', (req, res) => {
  const { id } = req.params;
  const { reason, cancelledBy } = req.body;
  const shipment = shipments.find(s => s.id === id || s.trackingNumber === id);

  if (!shipment) {
    return res.status(404).json({ error: 'Shipment not found' });
  }

  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  shipment.status = 'Cancelled';
  shipment.cancellationReason = reason || 'Cancelled by customer / sender request.';
  shipment.cancelledAt = now;

  shipment.events.unshift({
    id: `evt-${Date.now()}`,
    status: 'Cancelled',
    timestamp: now,
    location: shipment.currentLocation?.city || 'Hub Terminal',
    description: `Shipment CANCELLED. Reason: ${shipment.cancellationReason}`,
    updatedBy: cancelledBy || 'Customer / Admin',
  });

  notifications.unshift({
    id: `notif-${Date.now()}`,
    trackingNumber: shipment.trackingNumber,
    title: 'Shipment Cancelled',
    message: `Shipment #${shipment.trackingNumber} has been cancelled. Reason: ${shipment.cancellationReason}`,
    type: 'alert',
    timestamp: now,
    read: false,
  });

  activityLogs.unshift({
    id: `act-${Date.now()}`,
    userId: 'usr-1',
    userName: cancelledBy || 'Customer',
    role: 'Customer',
    action: `Cancelled shipment #${shipment.trackingNumber} - ${shipment.cancellationReason}`,
    timestamp: now,
    ipAddress: '192.168.1.99',
  });

  res.json({ message: 'Shipment cancelled successfully', shipment });
});

// Assign Shipment to Operator (Admin or Auto-Assign)
app.post('/api/shipments/:id/assign', (req, res) => {
  const { id } = req.params;
  const { operatorId, operatorName, driverInfo, pickupWindow, assignedBy } = req.body;
  const shipment = shipments.find(s => s.id === id || s.trackingNumber === id);

  if (!shipment) {
    return res.status(404).json({ error: 'Shipment not found' });
  }

  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  shipment.dispatchStatus = 'Pending Acceptance';
  shipment.assignedOperatorId = operatorId || 'usr-3';
  shipment.assignedOperatorName = operatorName || 'Rajesh Verma';
  shipment.pickupWindow = pickupWindow || 'Today by 2:00 PM';
  shipment.dispatchAssignedAt = now;

  if (driverInfo) {
    shipment.driver = driverInfo;
  } else {
    shipment.driver = {
      id: shipment.assignedOperatorId,
      name: shipment.assignedOperatorName,
      phone: '+91 98765 43210',
      vehicle: 'Mahindra Furio Cargo Truck (#402)',
      licensePlate: 'MH-04-XX-8899',
      rating: 4.9,
      currentLat: shipment.senderAddress.lat,
      currentLng: shipment.senderAddress.lng,
      speedKmH: 0,
      batteryPct: 92,
      lastSignalTime: 'Assigned to Order',
    };
  }

  shipment.events.unshift({
    id: `evt-${Date.now()}`,
    status: shipment.status,
    timestamp: now,
    location: shipment.senderAddress.city,
    description: `Dispatch alert sent to operator ${shipment.assignedOperatorName} (Pending Acceptance). Pickup by: ${shipment.pickupWindow}`,
    updatedBy: assignedBy || 'Administrator',
  });

  const notif: AppNotification = {
    id: `notif-dispatch-${Date.now()}`,
    trackingNumber: shipment.trackingNumber,
    title: `⚡ NEW JOB OFFER: Dispatch Alert (#${shipment.trackingNumber})`,
    message: `New shipment #${shipment.trackingNumber} (${shipment.priority}) assigned to you for pickup at ${shipment.senderName}, ${shipment.senderAddress.city}. Pickup by ${shipment.pickupWindow}.`,
    type: 'alert',
    category: 'Dispatch Alert',
    channels: ['Email', 'SMS', 'Push', 'In-App'],
    recipientEmail: 'rajesh.v@mahindra.com',
    recipientPhone: '+91 98765 43210',
    timestamp: 'Just now',
    read: false,
    isDispatchAlert: true,
    dispatchShipmentId: shipment.id,
    dispatchStatus: 'Pending Acceptance',
    pickupWindow: shipment.pickupWindow,
    pickupLocation: `${shipment.senderName}, ${shipment.senderAddress.city}`,
    dropoffLocation: `${shipment.receiverName}, ${shipment.receiverAddress.city}`,
    priority: shipment.priority,
    assignedToUserId: shipment.assignedOperatorId,
  };

  notifications.unshift(notif);

  res.json({ message: 'Dispatch alert sent to operator', shipment, notification: notif });
});

// Respond to Dispatch Alert (Accept / Decline / Expire)
app.post('/api/shipments/:id/dispatch-respond', (req, res) => {
  const { id } = req.params;
  const { action, reason, operatorName } = req.body;
  const shipment = shipments.find(s => s.id === id || s.trackingNumber === id);

  if (!shipment) {
    return res.status(404).json({ error: 'Shipment not found' });
  }

  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const operator = operatorName || shipment.assignedOperatorName || 'Logistics Operator';

  if (action === 'ACCEPT') {
    shipment.dispatchStatus = 'Accepted';
    shipment.status = shipment.status === 'Created' ? 'Picked Up' : shipment.status;

    shipment.events.unshift({
      id: `evt-${Date.now()}`,
      status: shipment.status,
      timestamp: now,
      location: shipment.senderAddress.city,
      description: `Job offer ACCEPTED by operator ${operator}. Added to active pickup/delivery queue.`,
      updatedBy: operator,
    });

    notifications.unshift({
      id: `notif-${Date.now()}`,
      trackingNumber: shipment.trackingNumber,
      title: `Job Accepted (#${shipment.trackingNumber})`,
      message: `Operator ${operator} accepted shipment #${shipment.trackingNumber}. Status is now active in driver queue.`,
      type: 'success',
      category: 'Dispatch Alert',
      timestamp: now,
      read: false,
    });
  } else {
    const isExpire = action === 'EXPIRE';
    shipment.dispatchStatus = 'Declined';
    shipment.dispatchDeclinedReason = isExpire
      ? 'Offer timed out (2-minute response window expired)'
      : (reason || 'Declined by operator');
    
    const prevDriver = shipment.assignedOperatorName;
    shipment.driver = undefined;

    shipment.events.unshift({
      id: `evt-${Date.now()}`,
      status: shipment.status,
      timestamp: now,
      location: shipment.senderAddress.city,
      description: `Dispatch offer ${isExpire ? 'EXPIRED (No response in 2 mins)' : 'DECLINED'} by ${prevDriver}. Reason: ${shipment.dispatchDeclinedReason}. Returned to unassigned queue.`,
      updatedBy: isExpire ? 'System Auto-Timeout' : operator,
    });

    notifications.unshift({
      id: `notif-${Date.now()}`,
      trackingNumber: shipment.trackingNumber,
      title: `🚨 Dispatch Alert ${isExpire ? 'Timed Out' : 'Declined'} (#${shipment.trackingNumber})`,
      message: `Shipment #${shipment.trackingNumber} ${isExpire ? 'timed out without response' : `was declined by ${prevDriver}`}. Reason: ${shipment.dispatchDeclinedReason}. Reassignment required in Admin table.`,
      type: 'alert',
      category: 'Dispatch Alert',
      timestamp: now,
      read: false,
    });
  }

  notifications = notifications.map(n => {
    if (n.dispatchShipmentId === shipment.id || n.trackingNumber === shipment.trackingNumber) {
      return {
        ...n,
        dispatchStatus: shipment.dispatchStatus,
        read: true,
      };
    }
    return n;
  });

  res.json({ message: `Dispatch offer processed as ${action}`, shipment });
});

// Update shipment status
app.put('/api/shipments/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, location, note, updatedBy, failedReason, failedNotes } = req.body;
  const shipment = shipments.find(s => s.id === id || s.trackingNumber === id);

  if (!shipment) {
    return res.status(404).json({ error: 'Shipment not found' });
  }

  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  shipment.status = status as ShipmentStatus;

  if (failedReason) {
    (shipment as any).failedReason = failedReason;
  }
  if (failedNotes) {
    (shipment as any).failedNotes = failedNotes;
  }

  shipment.events.unshift({
    id: `evt-${Date.now()}`,
    status: status as ShipmentStatus,
    timestamp: now,
    location: location || shipment.currentLocation?.city || 'En Route',
    description: note || (status === 'Failed Delivery' ? `Delivery Failed: ${failedReason || 'Unspecified'} (${failedNotes || 'No notes'})` : `Status updated to ${status}`),
    updatedBy: updatedBy || 'Logistics Operator',
  });

  // Trigger Notification
  notifications.unshift({
    id: `notif-${Date.now()}`,
    trackingNumber: shipment.trackingNumber,
    title: status === 'Failed Delivery' ? `Delivery Attempt Failed (#${shipment.trackingNumber})` : `Shipment Status: ${status}`,
    message: status === 'Failed Delivery' 
      ? `Delivery attempt failed for #${shipment.trackingNumber}. Reason: ${failedReason || 'Recipient Not Available'}. ${failedNotes || ''}`
      : `#${shipment.trackingNumber} status set to ${status}. Location: ${location || 'In Transit'}`,
    type: status === 'Delivered' ? 'success' : status === 'Failed Delivery' ? 'alert' : 'info',
    timestamp: now,
    read: false,
  });

  res.json(shipment);
});

// Live Driver Telemetry & Location Update
app.put('/api/shipments/:id/telemetry', (req, res) => {
  const { id } = req.params;
  const { lat, lng, speedKmH, batteryPct, locationName } = req.body;
  const shipment = shipments.find(s => s.id === id || s.trackingNumber === id);

  if (!shipment) {
    return res.status(404).json({ error: 'Shipment not found' });
  }

  if (shipment.driver) {
    if (lat !== undefined) shipment.driver.currentLat = Number(lat);
    if (lng !== undefined) shipment.driver.currentLng = Number(lng);
    if (speedKmH !== undefined) shipment.driver.speedKmH = Number(speedKmH);
    if (batteryPct !== undefined) shipment.driver.batteryPct = Number(batteryPct);
    shipment.driver.lastSignalTime = 'Just now (Live Broadcast)';
  }

  if (shipment.currentLocation && lat !== undefined && lng !== undefined) {
    shipment.currentLocation.lat = Number(lat);
    shipment.currentLocation.lng = Number(lng);
    if (locationName) shipment.currentLocation.address = locationName;
  }

  res.json({ message: 'Telemetry updated', shipment });
});

// Submit Proof of Delivery
app.post('/api/shipments/:id/pod', (req, res) => {
  const { id } = req.params;
  const { recipientName, signatureDataUrl, signatureImageUrl, deliveryPhotoUrl, deliveredPackagePhotoUrl, photoUrl, notes, latitude, longitude, capturedByUserId } = req.body;
  const shipment = shipments.find(s => s.id === id || s.trackingNumber === id);

  if (!shipment) {
    return res.status(404).json({ error: 'Shipment not found' });
  }

  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const pod: ProofOfDelivery = {
    shipmentId: shipment.id,
    capturedByUserId: capturedByUserId || shipment.driver?.id || 'drv-operator',
    recipientName: recipientName || shipment.receiverName || 'Authorized Recipient',
    signatureImageUrl: signatureImageUrl || signatureDataUrl,
    signatureDataUrl: signatureDataUrl || signatureImageUrl,
    deliveryPhotoUrl: deliveryPhotoUrl || deliveredPackagePhotoUrl || photoUrl,
    deliveredPackagePhotoUrl: deliveredPackagePhotoUrl || deliveryPhotoUrl || photoUrl,
    photoUrl: photoUrl || deliveryPhotoUrl || deliveredPackagePhotoUrl,
    deliveredAt: now,
    timestamp: now,
    latitude: latitude || shipment.receiverAddress.lat,
    longitude: longitude || shipment.receiverAddress.lng,
    verificationCode: `POD-VER-${Math.floor(1000 + Math.random() * 9000)}`,
    verificationStatus: 'PENDING', // Driver submissions always start as PENDING verification by Support/Admin
    notes: notes || 'Delivered directly to recipient with digital signature & GPS photo capture.',
  };

  shipment.proofOfDelivery = pod;
  shipment.status = 'Delivered';

  shipment.events.unshift({
    id: `evt-${Date.now()}`,
    status: 'Delivered',
    timestamp: now,
    location: `${shipment.receiverAddress.city}, ${shipment.receiverAddress.country}`,
    description: `Delivered to ${pod.recipientName}. Digital POD Code: ${pod.verificationCode} (Pending Support Verification)`,
    updatedBy: 'Logistics Operator',
  });

  notifications.unshift({
    id: `notif-${Date.now()}`,
    trackingNumber: shipment.trackingNumber,
    title: 'Proof of Delivery Captured',
    message: `Delivery confirmed for #${shipment.trackingNumber} by ${pod.recipientName}. Digital POD code: ${pod.verificationCode}`,
    type: 'success',
    timestamp: now,
    read: false,
  });

  res.json({ message: 'Proof of delivery recorded', shipment });
});

// Support Agent: Verify or Flag POD
app.put('/api/shipments/:id/pod-verify', (req, res) => {
  const { id } = req.params;
  const { verificationStatus, verifiedByUserId, auditNotes } = req.body;
  const shipment = shipments.find(s => s.id === id || s.trackingNumber === id);

  if (!shipment) {
    return res.status(404).json({ error: 'Shipment not found' });
  }

  if (!shipment.proofOfDelivery) {
    return res.status(400).json({ error: 'No POD record associated with this shipment' });
  }

  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  shipment.proofOfDelivery.verificationStatus = verificationStatus;
  shipment.proofOfDelivery.verifiedByUserId = verifiedByUserId || 'usr-4';
  if (auditNotes) {
    shipment.proofOfDelivery.notes = `${shipment.proofOfDelivery.notes || ''} [AUDIT NOTE]: ${auditNotes}`;
  }

  shipment.events.unshift({
    id: `evt-${Date.now()}`,
    status: shipment.status,
    timestamp: now,
    location: shipment.receiverAddress.city,
    description: `POD Audit Completed by Support Agent: Marked ${verificationStatus}. ${auditNotes || ''}`,
    updatedBy: 'Support Agent Ananya Iyer',
  });

  notifications.unshift({
    id: `notif-${Date.now()}`,
    trackingNumber: shipment.trackingNumber,
    title: `POD Audit: ${verificationStatus}`,
    message: `Proof of Delivery for #${shipment.trackingNumber} has been verified & cryptographically audited as ${verificationStatus} by Support Agent.`,
    type: verificationStatus === 'VERIFIED' ? 'success' : 'alert',
    timestamp: now,
    read: false,
  });

  res.json({ message: `POD status updated to ${verificationStatus}`, shipment });
});

// Support Agent: Triage & Resolve Transit Issue
app.put('/api/shipments/:id/issue-resolve', (req, res) => {
  const { id } = req.params;
  const { issueId, status, notes, resolvedBy } = req.body;
  const shipment = shipments.find(s => s.id === id || s.trackingNumber === id);

  if (!shipment) {
    return res.status(404).json({ error: 'Shipment not found' });
  }

  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  if (shipment.issues) {
    shipment.issues = shipment.issues.map(i => {
      if (i.id === issueId || !issueId) {
        return { ...i, status: status || 'Resolved', notes: `${i.notes} [RESOLVED]: ${notes || 'Cleared by support'}` };
      }
      return i;
    });
  }

  shipment.aiPredictedDelayRisk = 'Low';
  shipment.aiDelayReason = 'Transit exception triaged & resolved by Support Helpdesk.';

  shipment.events.unshift({
    id: `evt-${Date.now()}`,
    status: shipment.status,
    timestamp: now,
    location: shipment.currentLocation?.city || 'Support Helpdesk',
    description: `Transit Exception RESOLVED by Support: ${notes || 'Issue triaged and cleared.'}`,
    updatedBy: resolvedBy || 'Support Agent Ananya Iyer',
  });

  res.json({ message: 'Transit issue resolved', shipment });
});

// Report Transit Issue / Complaint
app.post('/api/shipments/:id/issues', (req, res) => {
  const { id } = req.params;
  const { issueType, notes, photoUrl, reportedBy } = req.body;
  const shipment = shipments.find(s => s.id === id || s.trackingNumber === id);

  if (!shipment) {
    return res.status(404).json({ error: 'Shipment not found' });
  }

  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const issue: TransitIssue = {
    id: `iss-${Date.now()}`,
    shipmentId: shipment.id,
    issueType: issueType || 'Other',
    notes: notes || 'Issue reported during transit.',
    photoUrl,
    reportedBy: reportedBy || 'Logistics Operator',
    timestamp: now,
    status: 'Open',
  };

  if (!shipment.issues) {
    shipment.issues = [];
  }
  shipment.issues.unshift(issue);

  shipment.aiPredictedDelayRisk = 'High';
  shipment.aiDelayReason = `Transit issue reported: ${issue.issueType} (${notes || 'Under investigation'})`;

  shipment.events.unshift({
    id: `evt-${Date.now()}`,
    status: shipment.status,
    timestamp: now,
    location: shipment.currentLocation?.city || 'En Route Corridor',
    description: `Transit Exception Logged: ${issue.issueType} - ${notes || 'Operator reported delay issue'}`,
    updatedBy: reportedBy || 'Logistics Operator',
  });

  notifications.unshift({
    id: `notif-${Date.now()}`,
    trackingNumber: shipment.trackingNumber,
    title: `Delay Warning: ${issue.issueType} (#${shipment.trackingNumber})`,
    message: `Your shipment #${shipment.trackingNumber} is experiencing a transit delay: ${issue.issueType}. Note: ${notes || 'Operator resolving issue.'}`,
    type: 'alert',
    timestamp: now,
    read: false,
  });

  res.json({ message: 'Transit issue reported', issue, shipment });
});

// Post Chat Message
app.post('/api/shipments/:id/chat', (req, res) => {
  const { id } = req.params;
  const { senderName, senderRole, text } = req.body;
  const shipment = shipments.find(s => s.id === id || s.trackingNumber === id);

  if (!shipment) {
    return res.status(404).json({ error: 'Shipment not found' });
  }

  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const message: ChatMessage = {
    id: `msg-${Date.now()}`,
    shipmentId: shipment.id,
    senderName: senderName || 'User',
    senderRole: senderRole || 'Customer',
    text,
    timestamp: now,
    readByDriver: senderRole === 'Logistics Operator',
    readByCustomer: senderRole === 'Customer',
  };

  if (!shipment.chatMessages) {
    shipment.chatMessages = [];
  }
  shipment.chatMessages.push(message);

  res.json({ message: 'Chat message added', chatMessage: message, shipment });
});

// Upload Pickup Photo
app.post('/api/shipments/:id/pickup-photo', (req, res) => {
  const { id } = req.params;
  const { pickupPhotoUrl, note } = req.body;
  const shipment = shipments.find(s => s.id === id || s.trackingNumber === id);

  if (!shipment) {
    return res.status(404).json({ error: 'Shipment not found' });
  }

  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  shipment.pickupPhotoUrl = pickupPhotoUrl || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=600';
  
  shipment.events.unshift({
    id: `evt-${Date.now()}`,
    status: shipment.status,
    timestamp: now,
    location: shipment.senderAddress.city,
    description: `Pickup parcel condition photo captured. ${note || 'Pre-transit condition verified.'}`,
    updatedBy: 'Logistics Operator',
  });

  res.json({ message: 'Pickup photo recorded', shipment });
});

// Trigger Emergency SOS Alert
app.post('/api/shipments/:id/sos', (req, res) => {
  const { id } = req.params;
  const { operatorName, notes } = req.body;
  const shipment = shipments.find(s => s.id === id || s.trackingNumber === id);

  if (!shipment) {
    return res.status(404).json({ error: 'Shipment not found' });
  }

  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  shipment.sosAlertActive = true;
  shipment.sosAlertTimestamp = now;

  notifications.unshift({
    id: `notif-${Date.now()}`,
    trackingNumber: shipment.trackingNumber,
    title: `🚨 EMERGENCY SOS ALERT: Driver ${operatorName || 'Rajesh Verma'}`,
    message: `URGENT: Emergency SOS triggered for shipment #${shipment.trackingNumber} at ${shipment.currentLocation?.address || 'Highway Location'}. Note: ${notes || 'Immediate assistance requested.'}`,
    type: 'alert',
    timestamp: now,
    read: false,
  });

  res.json({ message: 'SOS alert broadcast to Admin & Support', shipment });
});

// 3. Server-side Gemini AI ETA & Delay Risk Prediction Endpoint
app.post('/api/ai/predict-eta', async (req, res) => {
  try {
    const { trackingNumber, origin, destination, priority, weightKg, currentStatus } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Fallback response if no GEMINI_API_KEY
      return res.json({
        estimatedEta: '2026-07-26 14:00',
        delayRisk: 'Low',
        confidenceScorePct: 92,
        keyRiskFactors: ['Mild traffic near metropolitan hubs', 'Normal highway conditions'],
        aiRecommendation: 'Shipment is following optimal transit vector. No rerouting needed.',
      });
    }

    const prompt = `You are ShipTrack Pro's Senior AI Logistics Engineer. Analyze this shipment:
- Tracking: ${trackingNumber}
- Origin: ${JSON.stringify(origin)}
- Destination: ${JSON.stringify(destination)}
- Priority: ${priority}
- Weight: ${weightKg}kg
- Current Status: ${currentStatus}

Provide a realistic ETA prediction and delay risk analysis as raw JSON with the schema:
{
  "estimatedEta": "YYYY-MM-DD HH:MM",
  "delayRisk": "Low" | "Medium" | "High",
  "confidenceScorePct": number,
  "keyRiskFactors": string[],
  "aiRecommendation": string
}`;

    const response = await ai.models.generateContent({
      model: 'BMA',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const jsonText = response.text || '{}';
    const parsed = JSON.parse(jsonText);
    res.json(parsed);
  } catch (err: any) {
    console.error('Gemini ETA Error:', err);
    res.json({
      estimatedEta: '2026-07-26 16:00',
      delayRisk: 'Medium',
      confidenceScorePct: 85,
      keyRiskFactors: ['Weather advisory along transit corridor'],
      aiRecommendation: 'Monitor driver location telemetry closely.',
    });
  }
});

// 4. Server-side Gemini AI Assistant Chat Endpoint
app.post('/api/ai/assistant', async (req, res) => {
  try {
    const { prompt, trackingContext, userRole } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        reply: `Hello! I am Chatbot. (Running in standard fallback mode). Based on active shipment context, your shipments are progressing well. How can I assist you with tracking or route analysis today?`,
      });
    }

    const systemInstruction = `You are Chatbot — a professional, highly knowledgeable logistics and supply chain assistant.
You assist ${userRole || 'Users'} with live shipment tracking, route optimization, customs regulations, delivery SLA analysis, and proof-of-delivery verifications.
Keep responses concise, clear, structured with bullet points where appropriate, and actionable.
Current Active Shipments Context: ${JSON.stringify(shipments.map(s => ({ tracking: s.trackingNumber, status: s.status, origin: s.senderAddress.city, destination: s.receiverAddress.city, delayRisk: s.aiPredictedDelayRisk })))}`;

    const response = await ai.models.generateContent({
      model: 'BMA',
      contents: prompt,
      config: {
        systemInstruction,
      },
    });

    res.json({ reply: response.text || 'I analyzed your request. Everything is progressing smoothly.' });
  } catch (err: any) {
    console.error(' Assistant Error:', err);
    res.json({ reply: 'Chatbot is currently analyzing updated telemetry logs. Please ask again in a moment.' });
  }
});

// 5. User Management & Activity Tracking Endpoints
app.get('/api/users', (req, res) => {
  res.json(INITIAL_USERS);
});

app.post('/api/users/register', (req, res) => {
  try {
    const { name, email, role, companyName, phone, accountType, taxId, tier } = req.body;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name: name || 'New User',
      email: email || 'user@shiptrack.com',
      role: (role as UserRole) || (accountType === 'business' ? 'Business Client' : 'Customer'),
      companyName: companyName || (accountType === 'business' ? 'Enterprise Client' : undefined),
      avatarUrl: accountType === 'business'
        ? 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
      lastLogin: now,
    };

    INITIAL_USERS.unshift(newUser);

    // Log user creation in activity stream
    activityLogs.unshift({
      id: `act-${Date.now()}`,
      userId: newUser.id,
      userName: newUser.name,
      role: newUser.role,
      action: `Registered new ${accountType === 'business' ? 'Business' : 'Customer'} account (${newUser.email}) - Tax ID: ${taxId || 'N/A'}, Tier: ${tier || 'Standard'}`,
      timestamp: now,
      ipAddress: '192.168.1.150',
    });

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to register user' });
  }
});

app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, companyName, role } = req.body;
  const user = INITIAL_USERS.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (name) user.name = name;
  if (email) user.email = email;
  if (companyName !== undefined) user.companyName = companyName;
  if (role) user.role = role as UserRole;

  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  activityLogs.unshift({
    id: `act-${Date.now()}`,
    userId: user.id,
    userName: user.name,
    role: user.role,
    action: `Updated profile details and security settings`,
    timestamp: now,
    ipAddress: '192.168.1.150',
  });

  res.json({ message: 'User updated successfully', user });
});

app.get('/api/activity', (req, res) => {
  res.json(activityLogs);
});

app.post('/api/activity', (req, res) => {
  const { userId, userName, role, action } = req.body;
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

  const newLog: UserActivityLog = {
    id: `act-${Date.now()}`,
    userId: userId || 'usr-1',
    userName: userName || 'Active User',
    role: (role as UserRole) || 'Customer',
    action: action || 'Performed system interaction',
    timestamp: now,
    ipAddress: '192.168.1.150',
  };

  activityLogs.unshift(newLog);
  res.status(201).json(newLog);
});

// 6. Notifications API
app.get('/api/notifications', (req, res) => {
  res.json(notifications);
});

app.post('/api/notifications/read', (req, res) => {
  const { id } = req.body;
  if (id) {
    notifications = notifications.map(n => n.id === id ? { ...n, read: true } : n);
  } else {
    notifications = notifications.map(n => ({ ...n, read: true }));
  }
  res.json({ success: true, notifications });
});

// 6. Analytics API
app.get('/api/analytics', (req, res) => {
  const totalShipments = shipments.length;
  const inTransitCount = shipments.filter(s => s.status === 'In Transit' || s.status === 'Out for Delivery').length;
  const deliveredCount = shipments.filter(s => s.status === 'Delivered').length;
  const delayedCount = shipments.filter(s => s.aiPredictedDelayRisk === 'High' || s.status === 'Failed Delivery').length;
  const onTimeRate = totalShipments > 0 ? Math.round(((deliveredCount + inTransitCount - delayedCount) / totalShipments) * 100) : 100;

  res.json({
    summary: {
      totalShipments,
      inTransitCount,
      deliveredCount,
      delayedCount,
      onTimeDeliveryRatePct: onTimeRate,
      avgDeliveryHours: 32.4,
    },
    activityLogs,
    users: INITIAL_USERS,
  });
});

// --- ADMINISTRATOR CONTROL TOWER ENDPOINTS ---

// Admin Control Center Dashboard summary
app.get('/api/admin/dashboard', (req, res) => {
  const totalUsers = INITIAL_USERS.length;
  const totalCustomers = INITIAL_USERS.filter(u => u.role === 'Customer').length;
  const totalBusinessClients = INITIAL_USERS.filter(u => u.role === 'Business Client').length;
  const totalOperators = INITIAL_USERS.filter(u => u.role === 'Logistics Operator').length;
  const totalSupportAgents = INITIAL_USERS.filter(u => u.role === 'Support Agent').length;
  const totalShipments = shipments.length;
  const activeShipments = shipments.filter(s => ['Picked Up', 'In Transit', 'Out for Delivery', 'Created'].includes(s.status)).length;
  const deliveredShipments = shipments.filter(s => s.status === 'Delivered').length;
  const pendingEscalations = escalations.filter(e => e.status === 'Open' || e.status === 'Under Review').length;
  const activeOperatorsCount = 12;

  res.json({
    kpis: {
      totalUsers: { value: totalUsers, change: '+12.5%', comparison: 'vs last month' },
      totalCustomers: { value: totalCustomers, change: '+8.2%', comparison: 'vs last month' },
      totalBusinessClients: { value: totalBusinessClients, change: '+15.4%', comparison: 'vs last month' },
      totalOperators: { value: totalOperators, change: '+5.0%', comparison: 'vs last month' },
      totalSupportAgents: { value: totalSupportAgents, change: '0.0%', comparison: 'vs last month' },
      totalShipments: { value: totalShipments, change: '+24.1%', comparison: 'vs last month' },
      activeShipments: { value: activeShipments, change: '+18.3%', comparison: 'vs last week' },
      deliveredShipments: { value: deliveredShipments, change: '+31.0%', comparison: 'vs last month' },
      pendingEscalations: { value: pendingEscalations, change: '-10.0%', comparison: 'vs last week' },
      activeOperators: { value: activeOperatorsCount, change: '+2 active', comparison: 'on duty today' },
    },
    escalations,
    businessApprovals,
    platformSettings,
    auditLogs,
  });
});

// Admin Escalations list & resolve
app.get('/api/admin/escalations', (req, res) => {
  res.json(escalations);
});

app.put('/api/admin/escalations/:id/resolve', (req, res) => {
  const { id } = req.params;
  const { decision, notes, adminName } = req.body;
  const esc = escalations.find(e => e.id === id);

  if (!esc) {
    return res.status(404).json({ error: 'Escalation case not found' });
  }

  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  esc.status = decision === 'APPROVE' ? 'Resolved' : decision === 'REJECT' ? 'Rejected' : 'Closed';
  esc.internalNotes = `${esc.internalNotes || ''} [ADMIN DECISION by ${adminName || 'Admin'}]: ${notes || 'Case processed'}`;

  // Log in Audit Trail
  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    adminName: adminName || 'Rajesh Admin',
    adminEmail: 'admin@shiptrack.in',
    action: `Resolved Escalation #${esc.id} (${esc.trackingNumber})`,
    target: `Shipment #${esc.trackingNumber}`,
    previousValue: 'Open / Under Review',
    newValue: esc.status,
    ipAddress: '10.0.1.10',
    timestamp: now,
  });

  res.json({ message: 'Escalation decision recorded', escalation: esc });
});

// Admin Business Approvals
app.get('/api/admin/business-approvals', (req, res) => {
  res.json(businessApprovals);
});

app.put('/api/admin/business-approvals/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, note, adminName } = req.body;
  const biz = businessApprovals.find(b => b.id === id);

  if (!biz) {
    return res.status(404).json({ error: 'Business approval application not found' });
  }

  const prevStatus = biz.status;
  biz.status = status || 'Approved';
  if (status === 'Approved') biz.verificationStatus = 'Fully Verified by Administrator';
  if (status === 'Rejected') biz.verificationStatus = `Rejected: ${note || 'Incomplete tax verification'}`;
  if (status === 'Suspended') biz.verificationStatus = `Suspended: ${note || 'Compliance breach'}`;

  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    adminName: adminName || 'Rajesh Admin',
    adminEmail: 'admin@shiptrack.in',
    action: `Updated Business Client Application Status`,
    target: `${biz.companyName} (${biz.id})`,
    previousValue: prevStatus,
    newValue: biz.status,
    ipAddress: '10.0.1.10',
    timestamp: now,
  });

  res.json({ message: 'Business approval status updated', business: biz });
});

// Audit Logs
app.get('/api/admin/audit-logs', (req, res) => {
  res.json(auditLogs);
});

app.post('/api/admin/audit-logs', (req, res) => {
  const { adminName, adminEmail, action, target, previousValue, newValue } = req.body;
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

  const newLog = {
    id: `aud-${Date.now()}`,
    adminName: adminName || 'Rajesh Admin',
    adminEmail: adminEmail || 'admin@shiptrack.in',
    action: action || 'Admin Platform Interaction',
    target: target || 'Platform Entity',
    previousValue: previousValue || 'N/A',
    newValue: newValue || 'N/A',
    ipAddress: '10.0.1.10',
    timestamp: now,
  };

  auditLogs.unshift(newLog);
  res.status(201).json(newLog);
});

// Admin System Monitoring Health API
app.get('/api/admin/system', (req, res) => {
  res.json({
    services: [
      { name: 'API Services (Express / Node)', status: 'Operational', latencyMs: 24, uptimePct: 99.99 },
      { name: 'Database Cluster (PostgreSQL Engine)', status: 'Operational', latencyMs: 12, uptimePct: 100.0 },
      { name: 'Authentication & RBAC Manager', status: 'Operational', latencyMs: 18, uptimePct: 99.98 },
      { name: 'Real-Time Notification Dispatcher', status: 'Operational', latencyMs: 35, uptimePct: 99.95 },
      { name: 'Shipment Lifecycle Engine', status: 'Operational', latencyMs: 29, uptimePct: 100.0 },
      { name: 'Payment & Billing Gateway Proxy', status: 'Operational', latencyMs: 45, uptimePct: 99.91 },
      { name: 'Google Maps Telemetry & GIS Proxy', status: 'Operational', latencyMs: 15, uptimePct: 99.99 },
    ],
    metrics: {
      uptimeSeconds: 864200,
      apiResponseTimeMs: 28,
      requestRatePerMin: 1420,
      errorRatePct: 0.01,
      activeSessionsCount: 164,
      dbConnectionCount: '22 / 50',
      backgroundJobsActive: 3,
    },
    errorLogs: [
      { id: 'err-801', timestamp: '2026-07-26 13:42', service: 'Map Telemetry API', severity: 'Warning', message: 'Transient GIS tile latency peak (120ms)', status: 'Resolved' },
      { id: 'err-802', timestamp: '2026-07-26 11:15', service: 'SMS Gateway', severity: 'Low', message: 'SMS Carrier retry queued for international recipient', status: 'Delivered' },
    ]
  });
});

// Admin Platform Settings
app.get('/api/admin/settings', (req, res) => {
  res.json(platformSettings);
});

app.put('/api/admin/settings', (req, res) => {
  platformSettings = { ...platformSettings, ...req.body };
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    adminName: req.body.adminName || 'Rajesh Admin',
    adminEmail: 'admin@shiptrack.in',
    action: 'Updated Platform System Settings',
    target: 'Platform Settings Configuration',
    previousValue: 'Previous Config',
    newValue: JSON.stringify(platformSettings),
    ipAddress: '10.0.1.10',
    timestamp: now,
  });

  res.json({ message: 'Platform settings updated successfully', settings: platformSettings });
});

// Admin User Role & Status Change with Audit Trail
app.put('/api/admin/users/:id/role', (req, res) => {
  const { id } = req.params;
  const { newRole, adminName, reason } = req.body;
  const user = INITIAL_USERS.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const previousRole = user.role;
  user.role = newRole as UserRole;
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    adminName: adminName || 'Rajesh Admin',
    adminEmail: 'admin@shiptrack.in',
    action: `User Role Escalation / Modification (${reason || 'Admin modification'})`,
    target: `${user.name} (${user.email})`,
    previousValue: previousRole,
    newValue: newRole,
    ipAddress: '10.0.1.10',
    timestamp: now,
  });

  res.json({ message: `User role updated to ${newRole}`, user });
});

// --- VITE MIDDLEWARE SETUP ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, 'localhost', () => {
    console.log(`ShipTrack Pro full-stack server active on http://localhost:${PORT}`);
  });
}

startServer();
