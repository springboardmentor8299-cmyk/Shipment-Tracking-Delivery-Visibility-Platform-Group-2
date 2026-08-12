import { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { toast } from "react-toastify";
import LeafletMapView from "../components/maps/LeafletMapView";

function TrackShipment() {
    const [trackingValue, setTrackingValue] = useState("");
    const [shipment, setShipment] = useState(null);
    const [history, setHistory] = useState([]);
    const [monitor, setMonitor] = useState(null);
    const [loading, setLoading] = useState(false);
    const [geocodedSource, setGeocodedSource] = useState(null);
    const [geocodedDestination, setGeocodedDestination] = useState(null);

    const getBadgeClass = (status) => {
        switch (status) {
            case "CREATED": return "bg-primary";
            case "PENDING": return "bg-secondary";
            case "PICKED_UP": return "bg-primary";
            case "IN_TRANSIT": return "bg-warning text-dark";
            case "OUT_FOR_DELIVERY": return "bg-info text-dark";
            case "DELIVERY_FAILED": return "bg-danger";
            case "DELIVERED": return "bg-success";
            case "CANCELLED": return "bg-danger";
            default: return "bg-dark";
        }
    };

    const handleTrack = async () => {
        if (!trackingValue.trim()) {
            toast.error("Please enter a shipment ID or tracking number");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("token");

            const value = trackingValue.trim();
            const isNumericId = /^\d+$/.test(value);
            const shipmentResponse = await api.get(
                isNumericId ? `/shipments/${value}` : `/shipments/tracking/${encodeURIComponent(value)}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            const currentShipment = shipmentResponse.data;
            setShipment(currentShipment);
            setGeocodedSource(null);
            setGeocodedDestination(null);

            const monitorResponse = await api.get(`/tracking/monitor/${currentShipment.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const trackingResponse = await api.get(`/tracking/${currentShipment.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setHistory(trackingResponse.data);
            setMonitor(monitorResponse.data);

            if (trackingResponse.data.length === 0) {
                toast.info("No tracking history found");
            }
        } catch (error) {
            console.error(error);
            setShipment(null);
            setHistory([]);
            setMonitor(null);
            setGeocodedSource(null);
            setGeocodedDestination(null);
            toast.error(error.response?.data?.message || "Tracking data not found");
        } finally {
            setLoading(false);
        }
    };

    const rawSourceLocation = shipment?.sourceLatitude != null && shipment?.sourceLongitude != null
        ? { lat: shipment.sourceLatitude, lng: shipment.sourceLongitude }
        : null;

    const rawDestinationLocation = shipment?.destinationLatitude != null && shipment?.destinationLongitude != null
        ? { lat: shipment.destinationLatitude, lng: shipment.destinationLongitude }
        : null;

    const sourceLocation = rawSourceLocation || geocodedSource;

    const destinationLocation = rawDestinationLocation || geocodedDestination;

    const route = sourceLocation && destinationLocation
        ? [
            [sourceLocation.lat, sourceLocation.lng],
            [destinationLocation.lat, destinationLocation.lng]
        ]
        : [];

    const computedDistanceKm =
        shipment?.distanceKm ??
        monitor?.distanceKm ??
        (sourceLocation && destinationLocation
            ? haversineDistance(
                sourceLocation.lat,
                sourceLocation.lng,
                destinationLocation.lat,
                destinationLocation.lng
            )
            : null);

    const displayDistanceKm = computedDistanceKm;

    const displayEtaLabel =
        shipment?.estimatedMinutes != null
            ? formatEta(shipment.estimatedMinutes)
            : monitor?.etaLabel || "--";

    const displayMessage =
        shipment?.shipmentStatus === "DELIVERED"
            ? "Reached destination"
            : shipment?.estimatedMinutes != null
                ? `Estimated arrival in ${formatEta(shipment.estimatedMinutes)}`
                : monitor?.message || "--";

    const displayDelay =
        shipment?.delayMinutes != null
            ? `${shipment.delayMinutes} min`
            : monitor?.delayed
                ? "At risk"
                : "0 min";

    function formatEta(minutes) {
        const total = Number(minutes) || 0;
        const hours = Math.floor(total / 60);
        const mins = total % 60;
        if (hours <= 0) return `${mins} min`;
        return `${hours} hr ${String(mins).padStart(2, "0")} min`;
    }

    function haversineDistance(lat1, lon1, lat2, lon2) {
        const toRad = (value) => (value * Math.PI) / 180;
        const R = 6371;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) *
                Math.cos(toRad(lat2)) *
                Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    async function geocodeAddress(address) {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(address)}&limit=1`,
            {
                headers: {
                    "Accept-Language": "en"
                }
            }
        );

        const data = await response.json();
        return data?.[0] || null;
    }

    useEffect(() => {
        const hasSourceCoords =
            shipment?.sourceLatitude != null && shipment?.sourceLongitude != null;
        const hasDestCoords =
            shipment?.destinationLatitude != null && shipment?.destinationLongitude != null;

        if (!shipment || (hasSourceCoords && hasDestCoords)) {
            return;
        }

        if (!shipment.sourceAddress || !shipment.destinationAddress) {
            return;
        }

        let cancelled = false;

        const resolveLocations = async () => {
            try {
                const [source, destination] = await Promise.all([
                    hasSourceCoords
                        ? Promise.resolve({
                            lat: shipment.sourceLatitude,
                            lng: shipment.sourceLongitude
                        })
                        : geocodeAddress(shipment.sourceAddress),
                    hasDestCoords
                        ? Promise.resolve({
                            lat: shipment.destinationLatitude,
                            lng: shipment.destinationLongitude
                        })
                        : geocodeAddress(shipment.destinationAddress)
                ]);

                if (cancelled) return;

                setGeocodedSource(
                    source ? { lat: Number(source.lat), lng: Number(source.lon) } : null
                );
                setGeocodedDestination(
                    destination ? { lat: Number(destination.lat), lng: Number(destination.lon) } : null
                );
            } catch (error) {
                console.error(error);
            }
        };

        resolveLocations();

        return () => {
            cancelled = true;
        };
    }, [
        shipment?.id,
        shipment?.sourceAddress,
        shipment?.destinationAddress,
        shipment?.sourceLatitude,
        shipment?.sourceLongitude,
        shipment?.destinationLatitude,
        shipment?.destinationLongitude
    ]);

    return (
        <div className="container mt-4 mb-5">
            <h2 className="mb-4">Track Shipment</h2>

            <div className="input-group mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Shipment ID or Tracking Number"
                    value={trackingValue}
                    onChange={(e) => setTrackingValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleTrack();
                    }}
                />
                <button className="btn btn-primary" onClick={handleTrack} disabled={loading}>
                    {loading ? "Tracking..." : "Track"}
                </button>
            </div>

            <hr />

            {shipment && monitor && (
                <div className="card shadow-sm border-0 mb-4">
                    <div className="card-body">
                        <h5 className="mb-3">Shipment Details</h5>
                        <div className="row g-3">
                            <div className="col-md-4">
                                <p className="mb-2"><strong>ID:</strong> {shipment.id}</p>
                                <p className="mb-2"><strong>Tracking No:</strong> {shipment.trackingNumber}</p>
                                <p className="mb-2"><strong>Date:</strong> {shipment.createdAt ? new Date(shipment.createdAt).toLocaleString() : "--"}</p>
                                <p className="mb-2"><strong>Sender:</strong> {shipment.senderName}</p>
                                <p className="mb-2"><strong>Receiver:</strong> {shipment.receiverName}</p>
                            </div>
                            <div className="col-md-4">
                                <p className="mb-2"><strong>From:</strong> {shipment.sourceAddress || "--"}</p>
                                <p className="mb-2"><strong>To:</strong> {shipment.destinationAddress || shipment.receiverAddress || "--"}</p>
                                <p className="mb-2"><strong>Status:</strong> {shipment.shipmentStatus}</p>
                                <p className="mb-2"><strong>Weight:</strong> {shipment.packageWeight ?? "--"} kg</p>
                                <p className="mb-2"><strong>Creator:</strong> {shipment.createdBy?.fullName || "System"}</p>
                            </div>
                            <div className="col-md-4">
                                <p className="mb-2"><strong>Distance:</strong> {Number.isFinite(displayDistanceKm) ? `${Number(displayDistanceKm).toFixed(1)} km` : "--"}</p>
                                <p className="mb-2"><strong>ETA:</strong> {displayEtaLabel}</p>
                                <p className="mb-2"><strong>Delay:</strong> {displayDelay}</p>
                                <p className="mb-2"><strong>Forecast:</strong> {monitor?.deliveryForecast || "--"}</p>
                                <p className="mb-0"><strong>Message:</strong> {displayMessage}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {shipment && (
                <div className="card shadow-sm border-0 mb-4">
                    <div className="card-body p-0">
                        <LeafletMapView
                            source={sourceLocation ? [sourceLocation.lat, sourceLocation.lng] : null}
                            destination={destinationLocation ? [destinationLocation.lat, destinationLocation.lng] : null}
                            route={route}
                            reached={shipment.shipmentStatus === "DELIVERED"}
                        />
                    </div>
                </div>
            )}

            {!loading && history.length === 0 && (
                <div className="alert alert-info">
                    Enter a shipment ID to view shipment history.
                </div>
            )}

            {loading && (
                <div className="text-center mt-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="mt-3">Loading Tracking History...</p>
                </div>
            )}

            {!loading && history.map((item) => (
                <div key={item.id} className="card shadow-sm border-0 mb-3">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0">Shipment Status</h5>
                            <span className={`badge ${getBadgeClass(item.status)}`}>{item.status}</span>
                        </div>
                        <p className="mb-2"><strong>Location:</strong> {item.location}</p>
                        <p className="mb-2"><strong>Remarks:</strong> {item.remarks}</p>
                        <p className="mb-0 text-muted">
                            <strong>Updated At:</strong> {new Date(item.timestamp).toLocaleString()}
                        </p>
                    </div>
                </div>
            ))}

            {monitor?.googleMapsUrl && (
                <div className="mt-4">
                    <a
                        href={monitor.googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline-primary"
                    >
                        Open Route in Google Maps
                    </a>
                </div>
            )}
        </div>
    );
}

export default TrackShipment;
