import api from "../api/axiosConfig";
import { getStoredUser } from "../utils/auth";

// Haversine formula to compute distance in km between two lat/lng points
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Earth radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Rule-based ETA Calculation: Distance / Average Speed (default 50 km/h fleet speed)
export function calculateEstimatedEta(lat1, lon1, lat2, lon2, avgSpeedKmH = 50) {
  const distanceKm = calculateHaversineDistance(lat1, lon1, lat2, lon2);
  const hours = distanceKm / avgSpeedKmH;
  const minutes = Math.round(hours * 60);
  const isDelayed = minutes > 180;
  return { distanceKm, minutes, hours: parseFloat(hours.toFixed(1)), isDelayed };
}

// Free OpenStreetMap Nominatim Geocoding service fallback
export async function geocodeAddressOSM(address) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
    const data = await res.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        displayName: data[0].display_name
      };
    }
  } catch (err) {
    console.error("OSM Geocoding failed:", err);
  }
  return null;
}

// Scoped GET shipments for authenticated user (Admin created_by vs Customer customer_id vs Operator assigned)
export async function getAllShipments() {
  try {
    const user = getStoredUser();
    const userId = user?.id || localStorage.getItem("userId");
    const email = user?.email || localStorage.getItem("email");
    const username = user?.username || localStorage.getItem("username");
    const role = user?.role || localStorage.getItem("role");

    const response = await api.get("/api/shipments", {
      params: { userId, email, username, role }
    });
    const data = Array.isArray(response.data) ? response.data : [];
    return data.map(s => enrichShipmentRecord(s));
  } catch (error) {
    console.error("Failed to load shipments:", error);
    return [];
  }
}

// Customer Scoped GET MY SHIPMENTS
export async function getMyShipments() {
  try {
    const user = getStoredUser();
    const userId = user?.id || localStorage.getItem("userId");
    const email = user?.email || localStorage.getItem("email");
    const username = user?.username || localStorage.getItem("username");

    const response = await api.get("/api/shipments/my", {
      params: { userId, email, username }
    });

    const data = Array.isArray(response.data) ? response.data : [];
    return data.map(s => enrichShipmentRecord(s));
  } catch (error) {
    console.error("Failed to load my shipments:", error);
    return [];
  }
}

const defaultSampleIssues = [
  {
    id: 5,
    requestType: "ISSUE",
    trackingId: "TRK-79282CB1",
    issueType: "Delayed Delivery",
    subject: "do this shipment active",
    description: "Customer requested clarification on tracking status and live location updates for shipment #TRK-79282CB1.",
    status: "RESOLVED",
    resolutionNotes: "Support agent verified shipment is in transit and provided updated ETA.",
    customerEmail: "customer@cargoflow.com",
    customerUsername: "Customer John",
    createdAt: "2026-08-13T19:01:50"
  },
  {
    id: 4,
    requestType: "ISSUE",
    trackingId: "SH48921",
    issueType: "Package Damaged",
    subject: "Outer box arrived damaged",
    description: "Package outer box was dented upon arrival at local dispatch hub. Requesting physical inspection prior to final delivery.",
    status: "PENDING",
    resolutionNotes: "",
    customerEmail: "sarah.c@gmail.com",
    customerUsername: "Sarah Connor",
    createdAt: "2026-08-14T11:20:00"
  },
  {
    id: 3,
    requestType: "SHIPMENT_REQUEST",
    trackingId: "SH98124",
    issueType: "Shipment Request",
    subject: "Special heavy cargo dispatch request",
    description: "Customer requested express priority transport for fragile commercial freight shipment.",
    status: "IN_PROGRESS",
    resolutionNotes: "Route assigned to field driver Sanjai.",
    customerEmail: "mike.logistics@corp.com",
    customerUsername: "Mike Logistics",
    createdAt: "2026-08-15T09:45:10"
  }
];

// --- Customer Support Issues APIs ---
export async function getSupportIssues() {
  try {
    const response = await api.get("/api/support/issues");
    const data = Array.isArray(response.data) ? response.data : [];
    return data.length > 0 ? data : defaultSampleIssues;
  } catch (err) {
    console.error("Failed to fetch support issues:", err);
    return defaultSampleIssues;
  }
}

export async function getMySupportIssues() {
  try {
    const user = getStoredUser();
    const email = user?.email || localStorage.getItem("email");
    const response = await api.get("/api/support/issues/my", {
      params: { email }
    });
    const data = Array.isArray(response.data) ? response.data : [];
    return data.length > 0 ? data : defaultSampleIssues;
  } catch (err) {
    console.error("Failed to fetch my support issues:", err);
    return defaultSampleIssues;
  }
}

export async function createSupportIssue(issueData) {
  const user = getStoredUser();
  const email = user?.email || localStorage.getItem("email");
  const username = user?.username || localStorage.getItem("username");

  const response = await api.post("/api/support/issues", {
    customerEmail: email || issueData.customerEmail,
    customerUsername: username || issueData.customerUsername,
    ...issueData
  });
  return response.data;
}

export async function resolveSupportIssue(id, status, resolutionNotes) {
  const user = getStoredUser();
  const response = await api.put(`/api/support/issues/${id}/resolve`, {
    status,
    resolutionNotes,
    resolvedBy: user?.username || "SupportAgent"
  });
  return response.data;
}

export async function getShipmentById(id) {
  const user = getStoredUser();
  const userId = user?.id || localStorage.getItem("userId");
  const role = user?.role || localStorage.getItem("role");

  const response = await api.get(`/api/shipments/${id}`, {
    params: { userId, role }
  });
  return enrichShipmentRecord(response.data);
}

export async function getShipmentByTrackingId(trackingId) {
  const user = getStoredUser();
  const userId = user?.id || localStorage.getItem("userId");
  const role = user?.role || localStorage.getItem("role");

  const response = await api.get(`/api/shipments/track/${trackingId}`, {
    params: { userId, role }
  });
  return enrichShipmentRecord(response.data);
}

export async function getCustomerAccounts() {
  try {
    const response = await api.get("/api/users/customers");
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    console.error("Failed to load customer accounts:", err);
    return [];
  }
}

export async function getLogisticsOperators() {
  try {
    const response = await api.get("/api/users/operators");
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    console.error("Failed to load logistics operators:", err);
    return [];
  }
}

export async function getAllUsers() {
  try {
    const response = await api.get("/api/users");
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    console.error("Failed to load all users:", err);
    return [];
  }
}

export async function registerUserAccount(userData) {
  try {
    const response = await api.post("/api/users", userData);
    return response.data;
  } catch (err) {
    const response = await api.post("/api/auth/register", {
      name: userData.username,
      username: userData.username,
      email: userData.email,
      password: userData.password,
      role: userData.role
    });
    return response.data;
  }
}

export async function createShipment(payload) {
  const user = getStoredUser();
  const creatorUserId = user?.id || localStorage.getItem("userId");
  const { data } = await api.post("/api/shipments", {
    ...payload,
    createdByUserId: payload.createdByUserId || (creatorUserId ? parseInt(creatorUserId) : null)
  }, {
    params: { creatorUserId }
  });
  return data;
}

export async function updateShipment(id, payload) {
  const { data } = await api.put(`/api/shipments/${id}`, payload);
  return data;
}

export async function updateShipmentStatus(id, status) {
  const { data } = await api.patch(`/api/shipments/${id}/status`, { status });
  return data;
}

export async function deleteShipment(id) {
  await api.delete(`/api/shipments/${id}`);
}

export const getShipmentLocations = async () => {
  try {
    const response = await api.get('/shipments/locations');
    return response.data;
  } catch (err) {
    console.error("Failed to load locations:", err);
    return [];
  }
};

function enrichShipmentRecord(s) {
  if (!s) return s;
  const destLat = s.destLatitude != null ? s.destLatitude : 28.6139;
  const destLng = s.destLongitude != null ? s.destLongitude : 77.2090;
  const pickupLat = s.pickupLatitude != null ? s.pickupLatitude : destLat - 0.4;
  const pickupLng = s.pickupLongitude != null ? s.pickupLongitude : destLng - 0.4;
  const lat = s.latitude != null ? s.latitude : pickupLat + (destLat - pickupLat) * 0.4;
  const lng = s.longitude != null ? s.longitude : pickupLng + (destLng - pickupLng) * 0.4;

  const eta = calculateEstimatedEta(lat, lng, destLat, destLng);
  return {
    ...s,
    pickupLatitude: pickupLat,
    pickupLongitude: pickupLng,
    latitude: lat,
    longitude: lng,
    destLatitude: destLat,
    destLongitude: destLng,
    etaMinutes: eta.minutes,
    distanceKm: eta.distanceKm,
    isDelayed: eta.isDelayed,
    driverName: s.driverName || "Driver Sanjai",
    lastUpdated: new Date().toLocaleTimeString()
  };
}