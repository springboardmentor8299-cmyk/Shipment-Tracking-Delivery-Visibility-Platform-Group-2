import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";

import {
  getAllShipments,
  updateTruckLocation,
} from "../../services/shipmentService";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../../styles/Tracking.css";

const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;
const defaultCenter = [20.5937, 78.9629];

const createCustomIcon = (iconUrl, isTruck = false) => {
  return L.divIcon({
    className: "custom-map-pin",
    html: `
            <div class="pin-container ${isTruck ? "truck-pin" : ""}">
                <img src="${iconUrl}" class="pin-icon" alt="pin" />
            </div>
        `,
    iconSize: [38, 48],
    iconAnchor: [19, 48],
    popupAnchor: [0, -45],
  });
};

const originIcon = createCustomIcon(
  "https://cdn-icons-png.flaticon.com/512/684/684908.png",
);

const destinationIcon = L.divIcon({
  className: "custom-package-pin",
  html: `
        <div style="
            font-size: 26px;
            background: #ffffff;
            border: 2.5px solid #16a34a;
            border-radius: 50%;
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            cursor: pointer;
        ">
            📦
        </div>
    `,
  iconSize: [44, 44],
  iconAnchor: [22, 22],
  popupAnchor: [0, -22],
});

const truckIcon = L.divIcon({
  className: "custom-truck-pin",
  html: `
        <div style="
            font-size: 26px;
            background: #ffffff;
            border: 2.5px solid #2563eb;
            border-radius: 50%;
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
            cursor: pointer;
        ">
            🚚
        </div>
    `,
  iconSize: [44, 44],
  iconAnchor: [22, 22],
  popupAnchor: [0, -22],
});

const isValidLatLng = (coords) => {
  return (
    Array.isArray(coords) &&
    coords.length === 2 &&
    typeof coords[0] === "number" &&
    !isNaN(coords[0]) &&
    typeof coords[1] === "number" &&
    !isNaN(coords[1])
  );
};

const toRad = (deg) => (deg * Math.PI) / 180;

// Distance in km between two [lat, lng] points
const haversineDistanceKm = (a, b) => {
  if (!isValidLatLng(a) || !isValidLatLng(b)) return 0;

  const R = 6371;
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);

  const h =
    sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;

  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

// Sums distance across a polyline of [lat, lng] points
const calculateRouteDistanceKm = (points) => {
  if (!Array.isArray(points) || points.length < 2) return 0;

  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    total += haversineDistanceKm(points[i], points[i + 1]);
  }
  return total;
};

function MapBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    const validPoints = points.filter(isValidLatLng);
    if (validPoints.length > 0) {
      const bounds = L.latLngBounds(validPoints);
      if (validPoints.length >= 2) {
        map.fitBounds(L.latLngBounds(validPoints), { padding: [50, 50] });
      }
    }
  }, [points, map]);
  return null;
}

const calculateDelayPrediction = (shipment) => {
  const statusUpper = String(shipment.status || "").toUpperCase();
  if (statusUpper === "CANCELLED" || statusUpper === "DELIVERED") {
    return {
      risk: "NONE",
      label: "N/A",
      confidence: "100%",
      delayReason: "No delay risk.",
    };
  }

  const scheduledDate = new Date(shipment.deliveryDate);
  const now = new Date();

  if (!isNaN(scheduledDate.getTime()) && now > scheduledDate) {
    return {
      risk: "HIGH",
      label: "High Delay Risk",
      confidence: "92%",
      delayReason: "Schedule Exceeded: Shipment past target delivery date.",
    };
  }

  if (statusUpper === "PENDING") {
    return {
      risk: "MEDIUM",
      label: "Moderate Delay Risk",
      confidence: "75%",
      delayReason: "Pending Pick-Up: Transit process has not commenced yet.",
    };
  }

  return {
    risk: "LOW",
    label: "On Schedule",
    confidence: "95%",
    delayReason: "Smooth Transit: Operating within target timeline.",
  };
};

// Ordered shipment lifecycle used to derive timeline progress
const STATUS_ORDER = [
  "CREATED",
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

const getShipmentTimeline = (
  shipment,
  currentLocationLabel,
  currentLocationTime,
  remainingDistanceKm,
) => {
  const statusUpper = String(shipment.status || "").toUpperCase();

  if (statusUpper === "CANCELLED") {
    return [
      {
        title: "Order Placed",
        location: shipment.origin,
        time: shipment.shipmentDate,
        state: "completed",
      },
      {
        title: "Shipment Cancelled",
        location: "System / Request",
        time: shipment.deliveryDate || "Terminated",
        state: "cancelled",
      },
    ];
  }

  if (statusUpper === "FAILED_DELIVERY") {
    return [
      {
        title: "Order Confirmed",
        location: shipment.origin,
        time: shipment.shipmentDate,
        state: "completed",
      },
      {
        title: "Picked Up",
        location: `${shipment.origin} Hub`,
        time: shipment.shipmentDate,
        state: "completed",
      },
      {
        title: "Out for Delivery",
        location: currentLocationLabel || shipment.origin,
        time: currentLocationTime
          ? `Last updated: ${currentLocationTime.toLocaleTimeString()}`
          : "Live",
        state: "completed",
      },
      {
        title: "Delivery Failed",
        location: shipment.destination,
        time: shipment.deliveryDate || "Attempted",
        state: "cancelled",
      },
    ];
  }

  // Base progress purely from the recorded status.
  let rank = STATUS_ORDER.indexOf(statusUpper);
  if (rank === -1) rank = 0;

  // Let the truck's LIVE position push progress forward too — e.g. once
  // live route data exists the shipment is clearly moving, and once it's
  // within a few km of the destination it's effectively "out for delivery"
  // even if nobody has flipped the status field yet. This is what makes
  // the panel track the map, Amazon-style, instead of only the status.
  if (rank >= 1 && rank < 4 && remainingDistanceKm != null) {
    rank = Math.max(rank, 2); // has live tracking data -> at least in transit
    if (remainingDistanceKm <= 10) {
      rank = Math.max(rank, 3); // close to destination -> out for delivery
    }
  }

  return [
    {
      title: "Order Confirmed",
      location: shipment.origin,
      time: shipment.shipmentDate,
      state: "completed",
    },
    {
      title: "Picked Up",
      location: `${shipment.origin} Hub`,
      time: shipment.shipmentDate,
      state: rank >= 1 ? "completed" : "active",
    },
    {
      title: "Current Location",
      location: currentLocationLabel || shipment.origin,
      time: currentLocationTime
        ? `Last updated: ${currentLocationTime.toLocaleTimeString()}`
        : "Live",
      // Stays "active" (live) the whole time the shipment is moving —
      // it only becomes irrelevant once actually delivered, which never
      // reaches this branch since delivered shipments hide the timeline.
      state: rank === 0 ? "upcoming" : "active",
    },
    {
      title: "Destination Hub",
      location: shipment.destination,
      time: "",
      state: rank >= 3 ? "completed" : rank === 2 ? "active" : "upcoming",
    },
    {
      title: "Delivered",
      location: shipment.destination,
      time: shipment.deliveryDate,
      state: statusUpper === "DELIVERED" ? "completed" : "upcoming",
    },
  ];
};

function Tracking() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const [coordsMap, setCoordsMap] = useState({});
  const [routes, setRoutes] = useState({});
  const [truckPositions, setTruckPositions] = useState({});
  const [truckAddress, setTruckAddress] = useState({});
  const lastGeocodedIndexRef = useRef({});

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const moveTruck = async (shipment) => {
    const truck = truckPositions[shipment.id];
    const route = routes[shipment.id];

    if (!truck || !route) return;

    if (shipment.status === "DELIVERED") return;

    if (truck.index >= route.length - 1) return;

    const nextIndex = truck.index + 1;
    const nextPosition = route[nextIndex];
    const now = new Date();

    setTruckPositions((prev) => ({
      ...prev,
      [shipment.id]: {
        index: nextIndex,
        position: nextPosition,
        updatedAt: now,
      },
    }));

    try {
      await updateTruckLocation(
        shipment.trackingId,
        nextPosition[0],
        nextPosition[1],
        45,
        truckAddress[shipment.id],
      );
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (Object.keys(routes).length === 0) return;

    const timer = setInterval(() => {
      shipments.forEach((shipment) => {
        moveTruck(shipment);
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [shipments, routes, truckPositions, truckAddress]);

  const loadShipments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAllShipments();
      setShipments(Array.isArray(data) ? data : []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      setError("Unable to load shipment data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadShipments();

    const interval = setInterval(() => {
      loadShipments();
    }, 5000);

    return () => clearInterval(interval);
  }, [loadShipments]);

  useEffect(() => {
    setTruckAddress((prev) => {
      let changed = false;
      const next = { ...prev };

      shipments.forEach((shipment) => {
        if (!next[shipment.id] && shipment.currentLocationName) {
          next[shipment.id] = shipment.currentLocationName;
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [shipments]);

  const getCoordinates = async (place) => {
    if (!place) return null;
    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(place)}&apiKey=${GEOAPIFY_KEY}`,
      );
      const data = await response.json();
      if (!data.features || !data.features.length) return null;

      const [lng, lat] = data.features[0].geometry.coordinates;
      return [lat, lng];
    } catch (err) {
      console.error("Geocoding error:", err);
      return null;
    }
  };

  const getPlaceName = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${GEOAPIFY_KEY}`,
      );
      const data = await response.json();
      const props = data?.features?.[0]?.properties;
      if (!props) return null;

      return (
        props.city ||
        props.county ||
        props.state_district ||
        props.formatted ||
        null
      );
    } catch (err) {
      console.error("Reverse geocoding error:", err);
      return null;
    }
  };

  // Resolve the truck's live coordinates into a readable place name.
  // Throttled so we don't fire a reverse-geocode call on every 3s tick —
  // only once initially, and again every few hops down the route.
  useEffect(() => {
    Object.entries(truckPositions).forEach(([id, truck]) => {
      if (!truck || !isValidLatLng(truck.position)) return;

      const lastIdx = lastGeocodedIndexRef.current[id];
      const shouldGeocode =
        lastIdx === undefined || Math.abs(truck.index - lastIdx) >= 5;

      if (!shouldGeocode) return;
      lastGeocodedIndexRef.current[id] = truck.index;

      getPlaceName(truck.position[0], truck.position[1]).then((name) => {
        if (name) {
          setTruckAddress((prev) => ({ ...prev, [id]: name }));
        }
      });
    });
  }, [truckPositions]);

  const processShipmentLocations = async (shipment) => {
    if (!shipment.origin || !shipment.destination) return;

    try {
      let originCoords = coordsMap[shipment.id]?.origin;
      let destCoords = coordsMap[shipment.id]?.destination;

      if (!originCoords) originCoords = await getCoordinates(shipment.origin);
      if (!destCoords) destCoords = await getCoordinates(shipment.destination);

      if (originCoords && destCoords) {
        setCoordsMap((prev) => ({
          ...prev,
          [shipment.id]: { origin: originCoords, destination: destCoords },
        }));

        if (!routes[shipment.id]) {
          // If the backend already has a live GPS fix for this shipment
          // (persisted from a previous session), resume the route from
          // there instead of the original origin — this is what keeps the
          // map, remaining distance, and route line continuous across a
          // refresh or app reopen, rather than resetting to the start.
          const hasLiveTruckPosition =
            shipment.currentLatitude != null &&
            shipment.currentLongitude != null;

          const routeStart = hasLiveTruckPosition
            ? [shipment.currentLatitude, shipment.currentLongitude]
            : originCoords;

          const url = `https://api.geoapify.com/v1/routing?waypoints=${routeStart[0]},${routeStart[1]}|${destCoords[0]},${destCoords[1]}&mode=drive&apiKey=${GEOAPIFY_KEY}`;

          const response = await fetch(url);
          const routeData = await response.json();

          if (
            response.ok &&
            routeData.features &&
            routeData.features.length > 0
          ) {
            const rawCoords = routeData.features[0].geometry.coordinates;
            let polylineCoords = [];

            if (Array.isArray(rawCoords[0][0])) {
              polylineCoords = rawCoords.flatMap((line) =>
                line.map((pt) => [pt[1], pt[0]]),
              );
            } else {
              polylineCoords = rawCoords.map((pt) => [pt[1], pt[0]]);
              console.log(polylineCoords);
            }

            setRoutes((prev) => ({
              ...prev,
              [shipment.id]: polylineCoords,
            }));

            setTruckPositions((prev) => {
              if (prev[shipment.id]) {
                return prev;
              }

              return {
                ...prev,
                [shipment.id]: {
                  index: 0,
                  position: hasLiveTruckPosition
                    ? routeStart
                    : polylineCoords[0],
                  updatedAt: shipment.lastLocationUpdate
                    ? new Date(shipment.lastLocationUpdate)
                    : new Date(),
                },
              };
            });
            console.log("Truck Initialized", shipment.id);
            console.log(polylineCoords.length);
          } else {
            const fallbackRoute = [routeStart, destCoords];

            setRoutes((prev) => ({
              ...prev,
              [shipment.id]: fallbackRoute,
            }));

            setTruckPositions((prev) => ({
              ...prev,
              [shipment.id]: {
                index: 0,
                position: routeStart,
                updatedAt: shipment.lastLocationUpdate
                  ? new Date(shipment.lastLocationUpdate)
                  : new Date(),
              },
            }));
          }
        }
      }
    } catch (err) {
      console.error("Routing error:", err);
    }
  };

  useEffect(() => {
    shipments.forEach((shipment) => processShipmentLocations(shipment));
  }, [shipments]);

  const filteredShipments = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return shipments
      .filter((shipment) => {
        const matchesSearch =
          keyword === "" ||
          shipment.trackingId?.toLowerCase().includes(keyword) ||
          shipment.customerName?.toLowerCase().includes(keyword) ||
          shipment.origin?.toLowerCase().includes(keyword) ||
          shipment.destination?.toLowerCase().includes(keyword);

        if (!matchesSearch) return false;
        if (!shipment.shipmentDate) return true;

        const shipmentDate = new Date(shipment.shipmentDate);
        if (fromDate && shipmentDate < new Date(fromDate)) return false;

        if (toDate) {
          const to = new Date(toDate);
          to.setHours(23, 59, 59, 999);
          if (shipmentDate > to) return false;
        }

        return true;
      })
      .sort((a, b) => new Date(b.shipmentDate) - new Date(a.shipmentDate));
  }, [shipments, searchTerm, fromDate, toDate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, fromDate, toDate]);

  // Pagination
  const totalPages = Math.ceil(filteredShipments.length / itemsPerPage) || 1;
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentShipments = filteredShipments.slice(indexOfFirst, indexOfLast);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="tracking-view">
      {/* Header */}
      <div className="tracking-header">
        <div>
          <h1>Live Delivery Monitoring & ETA Insights</h1>
          <p>
            Real-time logistics tracking, automated route plotting, and delay
            forecasts.
          </p>
        </div>
        <div className="tracking-meta">
          <span className="meta-label">Auto Refresh:</span>
          <span>{lastUpdated ? lastUpdated.toLocaleTimeString() : "--"}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="tracking-search-panel">
        <input
          type="text"
          placeholder="Search Tracking ID / Customer"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="tracking-date-controls">
          <label>
            From
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </label>
          <label>
            To
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </label>
        </div>
        <button onClick={loadShipments} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && <div className="tracking-error">{error}</div>}

      <div className="tracking-summary">
        <div>
          <strong>{filteredShipments.length}</strong>
          <span>Active Tracked Shipments</span>
        </div>
        <div>
          <strong>
            {
              filteredShipments.filter((s) => {
                const pred = calculateDelayPrediction(s);
                return pred.risk === "HIGH";
              }).length
            }
          </strong>
          <span>High Delay Risk Alerts</span>
        </div>
      </div>

      <div className="tracking-list">
        {currentShipments.length > 0 ? (
          currentShipments.map((shipment) => {
            const isCancelled =
              String(shipment.status || "").toUpperCase() === "CANCELLED";
            const delayPrediction = calculateDelayPrediction(shipment);
            const isExpanded = expandedId === shipment.id;

            const route = routes[shipment.id];
            const truck = truckPositions[shipment.id];
            const originCoord = coordsMap[shipment.id]?.origin;
            const destCoord = coordsMap[shipment.id]?.destination;

            // Only the segment from the truck's current position onward —
            // the travelled portion (origin -> truck) is dropped from the
            // line so the route visibly shrinks as the truck advances,
            // Zepto/Swiggy-style.
            const remainingRoute =
              Array.isArray(route) && truck ? route.slice(truck.index) : route;

            const remainingDistanceKm =
              Array.isArray(remainingRoute) && remainingRoute.length > 1
                ? calculateRouteDistanceKm(remainingRoute)
                : null;

            const mapPoints =
              Array.isArray(remainingRoute) && remainingRoute.length > 0
                ? [...remainingRoute, destCoord].filter(isValidLatLng)
                : [originCoord, destCoord].filter(isValidLatLng);

            const currentLocationLabel =
              truckAddress[shipment.id] ||
              (truck && isValidLatLng(truck.position)
                ? `${truck.position[0].toFixed(4)}, ${truck.position[1].toFixed(4)}`
                : shipment.origin);

            const currentLocationTime =
              truck?.updatedAt ||
              (shipment.lastLocationUpdate
                ? new Date(shipment.lastLocationUpdate)
                : null);

            return (
              <div
                className={`tracking-card ${isExpanded ? "expanded" : ""}`}
                key={shipment.id || shipment.trackingId}
              >
                <div
                  className="tracking-card-compact"
                  onClick={() => toggleExpand(shipment.id)}
                >
                  <div className="tracking-info-main">
                    <h2>{shipment.trackingId}</h2>
                    <span className="customer-sub">
                      Customer: {shipment.customerName}
                    </span>
                  </div>

                  <div className="tracking-status-group">
                    {!isCancelled && (
                      <span
                        className={`risk-pill risk-${delayPrediction.risk.toLowerCase()}`}
                      >
                        {delayPrediction.label} ({delayPrediction.confidence})
                      </span>
                    )}

                    <div
                      className={`status-pill ${String(shipment.status)
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {shipment.status}
                    </div>

                    <button
                      className={`expand-btn ${isExpanded ? "open" : ""}`}
                      aria-label="Toggle Details"
                    >
                      ▼
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="tracking-card-expanded-body">
                    <div className="tracking-card-body">
                      <div>
                        <label>Origin</label>
                        <p>{shipment.origin}</p>
                      </div>
                      <div>
                        <label>Destination</label>
                        <p>{shipment.destination}</p>
                      </div>
                      <div>
                        <label>Shipment Date</label>
                        <p>{shipment.shipmentDate || "N/A"}</p>
                      </div>
                      <div>
                        <label>Target Delivery Date</label>
                        <p>
                          {isCancelled
                            ? "Cancelled"
                            : shipment.deliveryDate || "N/A"}
                        </p>
                      </div>

                      {/* Step 6: Show Remaining Distance */}
                      <div>
                        <label>Remaining Distance</label>
                        <p>
                          {shipment.status === "DELIVERED"
                            ? "0 km"
                            : remainingDistanceKm !== null
                              ? `${remainingDistanceKm.toFixed(1)} km`
                              : shipment.remainingDistance}
                        </p>
                      </div>

                      <div>
                        <label>Estimated Arrival</label>
                        <p>
                          {shipment.status === "DELIVERED"
                            ? "Delivered"
                            : shipment.estimatedDeliveryTime
                              ? new Date(
                                  shipment.estimatedDeliveryTime,
                                ).toLocaleString()
                              : "--"}
                        </p>
                      </div>

                      {/* Step 8: Show Last GPS Update */}
                      <div>
                        <label>Last GPS Update</label>
                        <p>
                          {shipment.lastLocationUpdate
                            ? new Date(
                                shipment.lastLocationUpdate,
                              ).toLocaleTimeString()
                            : "--"}
                        </p>
                      </div>
                    </div>

                    {delayPrediction.risk === "HIGH" && !isCancelled && (
                      <div className="delay-warning-box">
                        <strong>⚠️ Delay Alert:</strong>{" "}
                        {delayPrediction.delayReason}
                      </div>
                    )}

                    <div className="tracking-live-section">
                      {isCancelled || shipment.status === "DELIVERED" ? (
                        <div className="tracking-map-disabled">
                          <div
                            className="cancelled-icon"
                            style={{ fontSize: "50px" }}
                          >
                            📦
                          </div>
                          <h3>
                            {shipment.status === "DELIVERED"
                              ? "Shipment Delivered"
                              : "Tracking Terminated"}
                          </h3>

                          <p>
                            {shipment.status === "DELIVERED"
                              ? "Package has reached the destination."
                              : "This shipment was cancelled. Live map rendering is suspended."}
                          </p>
                        </div>
                      ) : (
                        <div className="tracking-map">
                          {isValidLatLng(originCoord) && (
                            <MapContainer
                              key={`${shipment.id}-${shipment.status}`} /*key={`${shipment.id}-${expandedId}`} */
                              center={originCoord}
                              zoom={6}
                              style={{
                                width: "100%",
                                height: "380px",
                                borderRadius: "10px",
                              }}
                            >
                              <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />

                              <MapBounds points={mapPoints} />

                              {/* Origin Marker (Red Pin) */}
                              {isValidLatLng(originCoord) && (
                                <Marker
                                  position={originCoord}
                                  icon={originIcon}
                                >
                                  <Popup>Origin: {shipment.origin}</Popup>
                                </Marker>
                              )}

                              {/* Destination Marker (Box Emoji Pin) */}
                              {isValidLatLng(destCoord) && (
                                <Marker
                                  position={destCoord}
                                  icon={destinationIcon}
                                >
                                  <Popup>
                                    Destination: {shipment.destination}
                                  </Popup>
                                </Marker>
                              )}

                              {/* Route Line — only truck's current position -> destination */}
                              {Array.isArray(remainingRoute) &&
                                remainingRoute.length > 0 && (
                                  <Polyline
                                    positions={remainingRoute}
                                    color="#0284c7"
                                    weight={4}
                                    dashArray="8, 8"
                                  />
                                )}

                              {/* Live Animated Truck Marker */}
                              {truck &&
                                truck.position &&
                                truck.position.length === 2 &&
                                !isNaN(truck.position[0]) &&
                                !isNaN(truck.position[1]) && (
                                  <Marker
                                    position={truck.position}
                                    icon={truckIcon}
                                  />
                                )}
                            </MapContainer>
                          )}
                        </div>
                      )}

                      <div className="tracking-timeline">
                        {shipment.status !== "DELIVERED" &&
                          getShipmentTimeline(
                            shipment,
                            currentLocationLabel,
                            currentLocationTime,
                            remainingDistanceKm,
                          ).map((step, index) => (
                            <div key={index} className="timeline-item">
                              <div className={`timeline-dot ${step.state}`} />
                              <div className="timeline-content">
                                <h4>{step.title}</h4>
                                <p>{step.location}</p>
                                {step.time && <small>{step.time}</small>}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div className="tracking-card-footer">
                      <div>Auto Monitoring: Active</div>
                      <div>
                        {isCancelled
                          ? "Shipment Cancelled"
                          : `ETA Status: ${delayPrediction.label}`}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="no-shipments-found">
            No shipments match your search criteria.
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="pagination-container">
        <span className="pagination-info">
          Showing{" "}
          <strong>{filteredShipments.length > 0 ? indexOfFirst + 1 : 0}</strong>{" "}
          to <strong>{Math.min(indexOfLast, filteredShipments.length)}</strong>{" "}
          of <strong>{filteredShipments.length}</strong> shipments
        </span>

        <div className="pagination-controls">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1 || loading}
          >
            Previous
          </button>

          <div className="pagination-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`pagination-number ${page === currentPage ? "active" : ""}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            className="pagination-btn"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages || loading}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default Tracking;
