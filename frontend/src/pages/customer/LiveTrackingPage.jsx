import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TrackingMapView from '../../components/maps/TrackingMapView';
import Navbar from '../../components/layout/Navbar';
import { track } from '../../services/shipmentService';

function LiveTrackingPage() {
    const { trackingNumber } = useParams();
    const navigate = useNavigate();
    const [shipmentId, setShipmentId] = useState(null);
    const [shipment, setShipment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!trackingNumber) return;

        track(trackingNumber)
            .then((data) => {
                setShipment(data);
                setShipmentId(data.id);
                setLoading(false);
            })
            .catch(() => {
                setError('No shipment found with that tracking number.');
                setLoading(false);
            });
    }, [trackingNumber]);

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="container py-5 text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <div className="container py-5">
                    <div className="alert alert-danger">{error}</div>
                    <button className="btn btn-primary" onClick={() => navigate('/')}>
                        Back to Home
                    </button>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="container py-5" style={{ maxWidth: '1200px' }}>
                <button className="btn btn-outline-secondary mb-4" onClick={() => navigate(-1)}>
                    <i className="bi bi-arrow-left me-2"></i>Back
                </button>

                <div className="card border-0 shadow-sm rounded-4">
                    <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h3 className="fw-bold mb-1" style={{ color: 'var(--brand-primary)' }}>
                                    Live Tracking
                                </h3>
                                <p className="text-muted mb-0">
                                    Tracking Number: <strong>{trackingNumber}</strong>
                                </p>
                            </div>
                            <span className="badge bg-primary rounded-pill px-3 py-2 fs-6">
                                {shipment?.status}
                            </span>
                        </div>

                        <TrackingMapView
                            shipmentId={shipmentId}
                            trackingNumber={trackingNumber}
                        />

                        {shipment?.events && shipment.events.length > 0 && (
                            <div className="mt-4">
                                <h5 className="fw-bold mb-3">Timeline</h5>
                                <ul className="list-unstyled">
                                    {shipment.events.map((event) => (
                                        <li key={event.id} className="mb-2 d-flex align-items-center gap-3">
                                            <div
                                                className="rounded-circle"
                                                style={{
                                                    width: '12px',
                                                    height: '12px',
                                                    background: 'var(--brand-primary)',
                                                }}
                                            />
                                            <div>
                                                <strong>{event.status}</strong>
                                                <span className="text-muted ms-2 small">
                                                    {event.recordedAt
                                                        ? new Date(event.recordedAt).toLocaleString()
                                                        : ''}
                                                </span>
                                                {event.latitude && event.longitude && (
                                                    <span className="text-muted ms-2 small">
                                                        ({event.latitude.toFixed(4)}, {event.longitude.toFixed(4)})
                                                    </span>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default LiveTrackingPage;
