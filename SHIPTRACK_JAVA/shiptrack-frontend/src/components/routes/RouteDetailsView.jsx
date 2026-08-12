import { useEffect, useMemo, useRef, useState } from "react";
import LeafletMapView from "../maps/LeafletMapView";

const TRUCK_INTERVAL_MS = 15000;

const formatDateTime = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString();
};

const formatDuration = (minutes) => {
    if (minutes == null) return "—";
    const total = Math.max(0, Number(minutes));
    if (total === 0) return "—";
    const hours = Math.floor(total / 60);
    const mins = Math.round(total % 60);
    if (hours === 0) return `${mins} min`;
    return `${hours} hr ${mins} min`;
};

const toLatLng = (point) =>
    point && point.latitude != null && point.longitude != null
        ? [point.latitude, point.longitude]
        : null;

const lerp = (a, b, t) => a + (b - a) * t;

const toRadians = (value) => (value * Math.PI) / 180;

const haversineKm = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2
        + Math.cos(toRadians(lat1))
        * Math.cos(toRadians(lat2))
        * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
};

const buildInterpolatedPath = (source, destination, segments = 20) => {
    const path = [];
    for (let i = 0; i <= segments; i += 1) {
        const t = i / segments;
        path.push({
            latitude: lerp(source.lat, destination.lat, t),
            longitude: lerp(source.lng, destination.lng, t)
        });
    }
    return path;
};

function RouteDetailsView({
    points = [],
    summary = null,
    source = null,
    destination = null,
    vehicle = null,
    reached = false,
    driverName = null,
    delivered = false,
    trackingNumber = null,
    estimatedDeliveryAt = null
}) {

    const routePoints = points.filter(
        (point) => point && point.latitude != null && point.longitude != null
    );

    const firstPoint = toLatLng(routePoints[0]);

    const lastPoint = toLatLng(routePoints[routePoints.length - 1]);

    const sourceLatLng = source ? [source.lat, source.lng] : null;

    const destinationLatLng = destination ? [destination.lat, destination.lng] : null;

    const startAnchor = sourceLatLng || firstPoint;

    const endAnchor = destinationLatLng || lastPoint;

    const pathKey = [
        routePoints.length >= 2 ? "pts" : routePoints.length === 1 ? "one" : "line",
        routePoints.length,
        source?.lat,
        source?.lng,
        destination?.lat,
        destination?.lng,
        firstPoint?.[0],
        firstPoint?.[1],
        lastPoint?.[0],
        lastPoint?.[1]
    ].join(":");

    const path = useMemo(() => {
        if (routePoints.length >= 2) {
            const result = [];
            if (startAnchor && (firstPoint[0] !== startAnchor[0] || firstPoint[1] !== startAnchor[1])) {
                result.push(startAnchor);
            }
            result.push(...routePoints.map(toLatLng));
            if (endAnchor && (lastPoint[0] !== endAnchor[0] || lastPoint[1] !== endAnchor[1])) {
                result.push(endAnchor);
            }
            return result;
        }
        if (startAnchor && endAnchor) {
            const from = { lat: startAnchor[0], lng: startAnchor[1] };
            const to = { lat: endAnchor[0], lng: endAnchor[1] };
            return buildInterpolatedPath(from, to).map(toLatLng);
        }
        return [];
        
    }, [pathKey]);

    const [stopIndex, setStopIndex] = useState(0);
    const [simStart, setSimStart] = useState(null);
    const [simEnd, setSimEnd] = useState(null);
    const stopIndexRef = useRef(0);

    useEffect(() => {
        if (path.length < 2) {
            Promise.resolve().then(() => {
                stopIndexRef.current = 0;
                setStopIndex(0);
                setSimStart(null);
                setSimEnd(null);
            });
            return undefined;
        }
        const totalSteps = path.length - 1;
        const startedAt = Date.now();
        Promise.resolve().then(() => {
            stopIndexRef.current = 0;
            setStopIndex(0);
            setSimStart(startedAt);
            setSimEnd(new Date(startedAt + totalSteps * TRUCK_INTERVAL_MS));
        });
        const interval = setInterval(() => {
            const next = Math.min(stopIndexRef.current + 1, totalSteps);
            stopIndexRef.current = next;
            setStopIndex(next);
            setSimEnd(new Date(Date.now() + (totalSteps - next) * TRUCK_INTERVAL_MS));
            if (next >= totalSteps) {
                clearInterval(interval);
            }
        }, TRUCK_INTERVAL_MS);
        return () => clearInterval(interval);
        
    }, [pathKey]);

    const truckPosition = path[stopIndex] || null;

    const progress = path.length > 1 ? stopIndex / (path.length - 1) : 0;

    const truckArrived = progress >= 1;

    const summaryDistanceKm = summary?.totalDistanceKm != null
        ? summary.totalDistanceKm
        : 0;

    const directDistanceKm = source && destination
        ? haversineKm(
            source.lat,
            source.lng,
            destination.lat,
            destination.lng
        )
        : 0;

    const totalDistanceKm = summaryDistanceKm > 0
        ? summaryDistanceKm
        : directDistanceKm;

    const distanceCoveredKm = totalDistanceKm * progress;

    const totalSteps = Math.max(0, path.length - 1);

    const deliveryDurationMinutes = totalSteps * (TRUCK_INTERVAL_MS / 60000);

    let delayLabel = "—";
    if (simEnd && estimatedDeliveryAt) {
        const delayMinutes = Math.round(
            (simEnd - new Date(estimatedDeliveryAt)) / 60000
        );
        if (delayMinutes > 0) {
            delayLabel = `${delayMinutes} min`;
        } else if (delayMinutes < 0) {
            delayLabel = `${Math.abs(delayMinutes)} min early`;
        } else {
            delayLabel = "On time";
        }
    }

    const start = summary?.startTime || points[0]?.timestamp || null;

    const remainingKm = Math.max(0, totalDistanceKm * (1 - progress));

    const currentStatus = !path.length
        ? null
        : truckArrived
            ? "DELIVERED"
            : stopIndex === 0
                ? "PICKED_UP"
                : remainingKm <= 5
                    ? "OUT_FOR_DELIVERY"
                    : "IN_TRANSIT";

    const STATUS_ORDER = [
        "PICKED_UP",
        "IN_TRANSIT",
        "OUT_FOR_DELIVERY",
        "DELIVERED"
    ];

    const currentStatusIndex = currentStatus
        ? STATUS_ORDER.indexOf(currentStatus)
        : -1;

    const outForDeliveryStep = totalDistanceKm > 5
        ? Math.ceil(totalSteps * (1 - 5 / totalDistanceKm))
        : 0;

    const outForDeliveryAt = simStart != null && outForDeliveryStep > 0
        ? new Date(simStart + outForDeliveryStep * TRUCK_INTERVAL_MS)
        : null;

    const timelineSteps = [
        {
            key: "PICKED_UP",
            label: "Picked Up",
            done: currentStatusIndex >= 0,
            ts: start
        },
        {
            key: "IN_TRANSIT",
            label: "In Transit",
            done: currentStatusIndex >= 1,
            ts: currentStatusIndex >= 1 && simStart != null
                ? new Date(simStart + TRUCK_INTERVAL_MS)
                : null
        },
        {
            key: "OUT_FOR_DELIVERY",
            label: "Out for Delivery",
            done: currentStatusIndex >= 2,
            ts: currentStatusIndex >= 2 && outForDeliveryAt
                ? outForDeliveryAt
                : null
        },
        {
            key: "DELIVERED",
            label: "Delivered",
            done: truckArrived,
            ts: truckArrived && simEnd ? simEnd : null
        }
    ];

    const infoRows = [
        {
            label: "Tracking Number",
            value: summary?.trackingNumber || trackingNumber || "—"
        },
        {
            label: "Driver",
            value: driverName || summary?.driverName || "Driver not assigned yet"
        },
        {
            label: "Route Date",
            value: start ? new Date(start).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }) : "—"
        },
        {
            label: "Start Time",
            value: formatDateTime(start)
        },
        {
            label: "End Time",
            value: path.length > 1 && simEnd ? formatDateTime(simEnd) : "—"
        },
        {
            label: "Total Stops",
            value: String(path.length)
        },
        {
            label: "Distance Covered",
            value: `${(
                truckArrived || reached || delivered
                    ? totalDistanceKm
                    : distanceCoveredKm
            ).toFixed(2)} km`
        },
        {
            label: "Delivery Duration",
            value: path.length > 1
                ? formatDuration(deliveryDurationMinutes)
                : "—"
        },
        {
            label: "Delay Duration",
            value: delayLabel
        }
    ];

    return (
        <div className="row g-3">

            <div className="col-lg-4">

                <div className="card shadow-sm h-100">

                    <div className="card-body">

                        <h6 className="mb-3">Route Details</h6>

                        <div className="d-grid gap-2">

                            {infoRows.map((row) => (
                                <div key={row.label}>
                                    <div className="text-muted small">
                                        {row.label}
                                    </div>
                                    <div className="fw-semibold">
                                        {row.value}
                                    </div>
                                </div>
                            ))}

                        </div>

                    </div>

                </div>

            </div>

            <div className="col-lg-8">

                <div className="card shadow-sm h-100">

                    <div className="card-body">

                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="mb-0">Route Map</h6>
                            {path.length > 1 && (
                                <span className="small text-muted">
                                    Truck en route — updates every 15 sec
                                </span>
                            )}
                        </div>

                        {path.length > 1 || source || destination || vehicle ? (
                            <LeafletMapView
                                source={sourceLatLng || toLatLng(routePoints[0])}
                                destination={destinationLatLng || toLatLng(routePoints[routePoints.length - 1])}
                                vehicle={vehicle}
                                route={path}
                                reached={reached || delivered}
                                truck={truckPosition}
                                truckArrived={truckArrived}
                                travelled={path.slice(0, stopIndex + 1)}
                            />
                        ) : (
                            <div className="alert alert-info mb-0">
                                No route or location data is available for this shipment yet.
                            </div>
                        )}

                    </div>

                </div>

            </div>

            {path.length > 1 && (
                <div className="col-12">

                    <div className="card shadow-sm">

                        <div className="card-body">

                            <h6 className="mb-3">Route Timeline</h6>

                            <div className="d-flex flex-column flex-md-row gap-2">

                                {timelineSteps.map((step) => (
                                    <div
                                        key={step.key}
                                        className={`flex-fill p-2 rounded border ${step.done
                                            ? "border-success bg-success-subtle"
                                            : "border-secondary bg-body-tertiary"}`}
                                    >
                                        <div className="small fw-semibold">
                                            {step.done ? "✓ " : ""}{step.label}
                                        </div>
                                        <div className="small text-muted">
                                            {step.ts ? formatDateTime(step.ts) : "—"}
                                        </div>
                                    </div>
                                ))}

                            </div>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}

export default RouteDetailsView;
