export type UserRole = 'Customer' | 'Business Client' | 'Logistics Operator' | 'Support Agent' | 'Administrator';

export type ShipmentStatus = 
  | 'Created'
  | 'Picked Up'
  | 'In Transit'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Failed Delivery'
  | 'Cancelled';

export type DispatchStatus = 'Unassigned' | 'Pending Acceptance' | 'Accepted' | 'Declined';

export type PriorityLevel = 'Standard' | 'Express' | 'Overnight' | 'Critical Freight';

export interface LocationPoint {
  city: string;
  state?: string;
  country: string;
  lat: number;
  lng: number;
  address?: string;
  street?: string;
  zipCode?: string;
}

export interface TrackingEvent {
  id: string;
  status: ShipmentStatus;
  timestamp: string;
  location: string;
  description: string;
  updatedBy: string;
}

export interface DriverInfo {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  licensePlate: string;
  rating: number;
  currentLat: number;
  currentLng: number;
  speedKmH: number;
  batteryPct: number;
  lastSignalTime: string;
}

export type PodVerificationStatus = 'PENDING' | 'VERIFIED' | 'FLAGGED';

export interface ProofOfDelivery {
  shipmentId?: string;
  capturedByUserId?: string;
  recipientName: string;
  signeeName?: string;
  signatureImageUrl?: string;
  signatureDataUrl?: string; // compatibility alias
  deliveryPhotoUrl?: string;
  deliveredPackagePhotoUrl?: string; // Explicit doorstep package photo
  photoUrl?: string; // compatibility alias
  deliveredAt: string;
  timestamp?: string;
  latitude?: number;
  longitude?: number;
  verificationCode: string;
  verificationStatus?: PodVerificationStatus;
  verifiedByUserId?: string;
  notes?: string;
}

export type IssueType = 
  | 'Vehicle Breakdown' 
  | 'Traffic/Road Block' 
  | 'Package Damaged in Transit' 
  | 'Weather Delay' 
  | 'Address Not Found' 
  | 'Recipient Unreachable' 
  | 'Safety Concern' 
  | 'Other';

export interface TransitIssue {
  id: string;
  shipmentId: string;
  issueType: IssueType;
  notes: string;
  photoUrl?: string;
  reportedBy: string;
  timestamp: string;
  status: 'Open' | 'Under Review' | 'Resolved';
}

export interface ChatMessage {
  id: string;
  shipmentId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  timestamp: string;
  readByDriver?: boolean;
  readByCustomer?: boolean;
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  companyName?: string;
  createdByUser?: string;
  senderName: string;
  senderPhone?: string;
  senderEmail?: string;
  senderAddress: LocationPoint;
  receiverName: string;
  receiverPhone?: string;
  receiverEmail?: string;
  receiverAddress: LocationPoint;
  status: ShipmentStatus;
  priority: PriorityLevel;
  weightKg: number;
  packageType: string;
  dimensionsCm: string; // e.g. "30x20x15"
  declaredValueUsd: number;
  contentsDescription?: string;
  isFragile?: boolean;
  isHazardous?: boolean;
  specialHandlingNotes?: string;
  createdAt: string;
  estimatedDeliveryTime: string;
  cancellationReason?: string;
  cancelledAt?: string;
  aiPredictedDelayRisk?: 'Low' | 'Medium' | 'High';
  aiDelayReason?: string;
  currentLocation?: LocationPoint;
  driver?: DriverInfo;
  events: TrackingEvent[];
  routePath: { lat: number; lng: number; name: string }[];
  currentRouteIndex: number;
  pickupPhotoUrl?: string;
  proofOfDelivery?: ProofOfDelivery;
  failedReason?: string;
  failedNotes?: string;
  issues?: TransitIssue[];
  chatMessages?: ChatMessage[];
  sosAlertActive?: boolean;
  sosAlertTimestamp?: string;
  dispatchStatus?: DispatchStatus;
  assignedOperatorId?: string;
  assignedOperatorName?: string;
  pickupWindow?: string;
  dispatchDeclinedReason?: string;
  dispatchAssignedAt?: string;
}

export type NotificationCategory = 'Shipment Update' | 'ETA Update' | 'Delivery Alert' | 'Delay Warning' | 'System Alert' | 'Dispatch Alert';
export type NotificationChannel = 'Email' | 'SMS' | 'Push' | 'In-App';

export interface AppNotification {
  id: string;
  trackingNumber: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  category?: NotificationCategory;
  channels?: NotificationChannel[];
  recipientEmail?: string;
  recipientPhone?: string;
  timestamp: string;
  read: boolean;
  isDispatchAlert?: boolean;
  dispatchShipmentId?: string;
  dispatchStatus?: DispatchStatus;
  pickupWindow?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  priority?: PriorityLevel;
  assignedToUserId?: string;
}

export interface NotificationChannelPreferences {
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  notifyOnShipmentUpdate: boolean;
  notifyOnEtaUpdate: boolean;
  notifyOnDeliveryAlert: boolean;
  notifyOnDelayWarning: boolean;
  smsPhoneNumber?: string;
  notificationEmail?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyName?: string;
  avatarUrl?: string;
  lastLogin: string;
}

export interface UserActivityLog {
  id: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: string;
  timestamp: string;
  ipAddress: string;
}

export interface RouteWaypoint {
  id: string;
  name: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  stopType: 'Pickup' | 'Waypoint Hub' | 'Delivery Dropoff';
  estimatedArrival: string;
  completed: boolean;
  packageCount?: number;
}

export interface RoutePlan {
  id: string;
  routeName: string;
  corridor: string;
  origin: string;
  destination: string;
  totalDistanceKm: number;
  estimatedDurationHours: number;
  trafficLevel: 'Low' | 'Moderate' | 'Heavy' | 'Severe Congestion';
  waypoints: RouteWaypoint[];
  fuelEstimateLiters: number;
  co2SavingsKg: number;
  status: 'Planned' | 'In Progress' | 'Optimized' | 'Completed';
  createdAt: string;
  completedAt?: string;
  efficiencyScorePct: number;
}

export interface AnalyticsSummary {
  totalShipments: number;
  inTransitCount: number;
  deliveredCount: number;
  delayedCount: number;
  onTimeDeliveryRatePct: number;
  avgDeliveryHours: number;
}
