import useRouteDetails from "./useRouteDetails";
import RouteDetailsView from "./RouteDetailsView";

function RouteDetailsModal({
    shipmentId,
    trackingNumber,
    onClose,
    vehicle = null,
    reached = false
}) {

    const { loading, points, summary, shipment, coords } = useRouteDetails(
        shipmentId,
        trackingNumber
    );

    const delivered = shipment?.shipmentStatus === "DELIVERED";

    const driverName = shipment?.driver?.fullName
        || shipment?.deliveryDriverName
        || null;

    return (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content">

                    <div className="modal-header">
                        <h5 className="modal-title">
                            Route Details — {trackingNumber || summary?.trackingNumber || `#${shipmentId}`}
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                        ></button>
                    </div>

                    <div className="modal-body">

                        {loading ? (

                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status"></div>
                            </div>

                        ) : (

                            <RouteDetailsView
                                points={points}
                                summary={summary}
                                source={coords.source}
                                destination={coords.destination}
                                vehicle={vehicle}
                                reached={reached}
                                driverName={driverName}
                                delivered={delivered}
                                trackingNumber={trackingNumber}
                                estimatedDeliveryAt={shipment?.estimatedDeliveryAt || null}
                            />

                        )}

                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default RouteDetailsModal;
