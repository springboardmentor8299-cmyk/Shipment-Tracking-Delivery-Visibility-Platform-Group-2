import { useState } from 'react';
import TrackingMapView from '../maps/TrackingMapView';
import { track } from '../../services/shipmentService';

function AdminLiveTracking() {
    const [trackingInput, setTrackingInput] = useState('');
    const [activeId, setActiveId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const val = trackingInput.trim();
        if (!val) return;
        setLoading(true);
        setError('');
        setActiveId(null);
        try {
            const shipment = await track(val);
            setActiveId(shipment.id);
        } catch {
            setError('No shipment found with that tracking number.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4">
                <h4 className="fw-bold mb-4" style={{ color: 'var(--brand-primary)' }}>
                    Live Tracking
                </h4>

                <form onSubmit={handleSubmit} className="mb-4">
                    <div className="input-group">
                        <input
                            type="text"
                            className="form-control form-control-lg"
                            placeholder="Enter Tracking Number (e.g. TRK123456)..."
                            value={trackingInput}
                            onChange={(e) => setTrackingInput(e.target.value)}
                        />
                        <button className="btn btn-primary px-4" type="submit" disabled={loading}>
                            {loading ? 'Searching...' : 'Track'}
                        </button>
                    </div>
                </form>

                {error && <div className="alert alert-danger mb-4">{error}</div>}

                {loading && (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                )}

                {activeId ? (
                    <TrackingMapView shipmentId={activeId} />
                ) : !loading && !error ? (
                    <div className="text-center py-5 text-muted">
                        <i className="bi bi-map display-1 d-block mb-3"></i>
                        <p>Enter a tracking number above to start live tracking.</p>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export default AdminLiveTracking;
