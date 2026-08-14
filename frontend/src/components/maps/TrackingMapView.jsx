import { useEffect, useState, useCallback } from 'react';
import LiveTrackingMap from './LiveTrackingMap';
import DelayAlert from './DelayAlert';
import { connectToTracking, disconnect } from '../../services/socketService';
import { fetchLiveTracking } from '../../services/shipmentService';

function TrackingMapView({ shipmentId, trackingNumber }) {
    const [shipment, setShipment] = useState(null);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [routePolyline, setRoutePolyline] = useState(null);
    const [historyPoints, setHistoryPoints] = useState([]);
    const [showHistory, setShowHistory] = useState(true);
    const [eta, setEta] = useState(null);
    const [delay, setDelay] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadShipment = useCallback(async () => {
        try {
            const id = shipmentId;
            const data = id ? await fetchLiveTracking(id) : null;
            if (data) {
                setShipment(data);
                if (data.latitude != null && data.longitude != null) {
                    setCurrentLocation({
                        latitude: data.latitude,
                        longitude: data.longitude,
                    });
                }
                if (data.estimatedDeliveryTime) {
                    setEta(data.estimatedDeliveryTime);
                }
                if (data.routePolyline) {
                    setRoutePolyline(data.routePolyline);
                }
            }
            setLoading(false);
        } catch {
            setError('Could not load tracking data');
            setLoading(false);
        }
    }, [shipmentId]);

    const loadHistory = useCallback(async () => {
        if (!shipmentId) return;
        try {
            const response = await fetch(`/api/shipments/${shipmentId}/route-history`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
            });
            if (response.ok) {
                const points = await response.json();
                if (Array.isArray(points) && points.length > 0) {
                    setHistoryPoints(points.filter((p) => p.latitude != null && p.longitude != null));
                }
            }
        } catch {
            // Route history is optional; ignore failures
        }
    }, [shipmentId]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadShipment();
        loadHistory();

        const historyTimer = setInterval(() => {
            loadHistory();
        }, 60000);

        return () => clearInterval(historyTimer);
    }, [loadShipment, loadHistory]);

    useEffect(() => {
        if (!shipmentId) return;

        connectToTracking(
            shipmentId,
            (data) => {
                setCurrentLocation({
                    latitude: data.latitude,
                    longitude: data.longitude,
                });
                if (data.latitude != null && data.longitude != null) {
                    setHistoryPoints((prev) => [
                        ...prev,
                        {
                            latitude: data.latitude,
                            longitude: data.longitude,
                            recordedAt: data.timestamp || new Date().toISOString(),
                        },
                    ]);
                }
            },
            (data) => {
                setEta(data.estimatedDeliveryTime);
            },
            (data) => {
                setDelay({
                    reason: data.delayReason,
                    delayMinutes: data.delayMinutes,
                    probability: data.probability,
                });
            }
        );

        return () => disconnect();
    }, [shipmentId]);

    if (loading) {
        return (
            <div className="d-flex align-items-center justify-content-center" style={{ height: 400 }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading tracking data...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    if (!shipment) {
        return <div className="alert alert-warning">No tracking data available.</div>;
    }

    const origin = shipment.originLatitude && shipment.originLongitude
        ? { latitude: shipment.originLatitude, longitude: shipment.originLongitude }
        : null;

    const destination = shipment.destinationLatitude && shipment.destinationLongitude
        ? { latitude: shipment.destinationLatitude, longitude: shipment.destinationLongitude }
        : null;

    const hasCoordinates = origin || destination;

    return (
        <div>
            {delay && <DelayAlert delay={delay} />}

            {!hasCoordinates && (
                <div className="alert alert-info d-flex align-items-center gap-2 mb-3">
                    <i className="bi bi-info-circle" />
                    <span>
                        Coordinates for this shipment are not available. The map will not display a route.
                        An admin can update the coordinates in the admin panel.
                    </span>
                </div>
            )}

            <LiveTrackingMap
                origin={origin}
                destination={destination}
                currentLocation={currentLocation}
                routePolyline={routePolyline}
                historyPoints={showHistory ? historyPoints : []}
                originLabel={shipment.senderName}
                destLabel={shipment.receiverName}
                originAddress={shipment.senderAddress}
                destAddress={shipment.deliveryAddress}
                distanceKm={shipment.totalDistance}
                durationMin={shipment.estimatedDuration}
                createdAt={shipment.createdAt}
                status={shipment.status}
            />

            {historyPoints.length > 0 && (
                <div className="mt-3">
                    <div className="card border-0 bg-body-tertiary rounded-3 p-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <h6 className="fw-bold mb-0" style={{ color: 'var(--brand-primary)' }}>
                                <i className="bi bi-route me-1" />
                                Route History
                            </h6>
                            <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => setShowHistory((prev) => !prev)}
                            >
                                {showHistory ? 'Hide' : 'Show'} on map
                            </button>
                        </div>
                        <div className="mt-2 text-muted small">
                            <span className="me-3">
                                <i className="bi bi-geo-alt me-1"></i>{historyPoints.length} tracked positions
                            </span>
                            <span className="me-3">
                                <i className="bi bi-flag me-1"></i>Started:{' '}
                                {historyPoints[0]?.recordedAt
                                    ? new Date(historyPoints[0].recordedAt).toLocaleString()
                                    : '-'}
                            </span>
                            <span>
                                <i className="bi bi-clock me-1"></i>Last:{' '}
                                {historyPoints[historyPoints.length - 1]?.recordedAt
                                    ? new Date(historyPoints[historyPoints.length - 1].recordedAt).toLocaleString()
                                    : '-'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-3">
                <div className="row g-3">
                    <div className="col-md-6">
                        <div className="card border-0 bg-body-tertiary rounded-3 p-3 h-100">
                            <h6 className="fw-bold mb-2" style={{ color: '#22c55e' }}>
                                <i className="bi bi-geo-fill me-1" />
                                Sender
                            </h6>
                            <p className="mb-1 fw-medium">{shipment.senderName}</p>
                            <p className="mb-0 text-muted small">{shipment.senderAddress}</p>
                            {origin && (
                                <p className="mb-0 text-muted small mt-1">
                                    {origin.latitude.toFixed(4)}, {origin.longitude.toFixed(4)}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="card border-0 bg-body-tertiary rounded-3 p-3 h-100">
                            <h6 className="fw-bold mb-2" style={{ color: '#ef4444' }}>
                                <i className="bi bi-geo-fill me-1" />
                                Receiver
                            </h6>
                            <p className="mb-1 fw-medium">{shipment.receiverName}</p>
                            <p className="mb-0 text-muted small">{shipment.deliveryAddress}</p>
                            {destination && (
                                <p className="mb-0 text-muted small mt-1">
                                    {destination.latitude.toFixed(4)}, {destination.longitude.toFixed(4)}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="d-flex flex-wrap gap-3 mt-3 align-items-center">
                    <p className="mb-1">
                        <strong>Status:</strong>{' '}
                        <span className="badge bg-primary rounded-pill px-3 py-2">
                            {shipment.status}
                        </span>
                    </p>
                    <p className="mb-1">
                        <strong>Tracking:</strong> {shipment.trackingNumber || trackingNumber}
                    </p>
                    {eta && (
                        <p className="mb-1">
                            <strong>Estimated Delivery:</strong>{' '}
                            {new Date(eta).toLocaleString()}
                        </p>
                    )}
                    {shipment.estimatedDuration && (
                        <p className="mb-0">
                            <strong>Est. Duration:</strong>{' '}
                            {shipment.estimatedDuration >= 60
                                ? `${Math.floor(shipment.estimatedDuration / 60)}h ${shipment.estimatedDuration % 60}m`
                                : `${shipment.estimatedDuration} min`}
                            {shipment.totalDistance ? ` (${shipment.totalDistance.toFixed(1)} km)` : ''}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TrackingMapView;
