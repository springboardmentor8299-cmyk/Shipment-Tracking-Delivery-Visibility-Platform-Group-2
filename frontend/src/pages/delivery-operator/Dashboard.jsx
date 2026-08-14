import { useState } from "react";
import DashboardNavbar from "../../components/dashboard/DashboardNavbar";
import WelcomeCard from "../../components/dashboard/WelcomeCard";
import DeliveriesTable from "../../components/delivery/DeliveriesTable";
import PodCaptureModal from "../../components/dashboard/PodCaptureModal";
import PodViewModal from "../../components/delivery/PodViewModal";

function DeliveryOperatorDashboard() {

    const [refreshKey, setRefreshKey] = useState(0);
    const [captureShipment, setCaptureShipment] = useState(null);
    const [podShipment, setPodShipment] = useState(null);

    return (
        <div className="dashboard-page">
            <DashboardNavbar />
            <div className="container py-5">
                <WelcomeCard />
                <div className="mt-4">
                    <DeliveriesTable
                        refreshKey={refreshKey}
                        onCapturePod={setCaptureShipment}
                        onViewPod={setPodShipment}
                    />
                </div>
            </div>

            {captureShipment && (
                <PodCaptureModal
                    shipmentId={captureShipment.id}
                    trackingNumber={captureShipment.trackingNumber}
                    receiverName={captureShipment.receiverName}
                    replacing={!!captureShipment.podVerificationStatus}
                    onSaved={() => setRefreshKey((prev) => prev + 1)}
                    onClose={() => setCaptureShipment(null)}
                />
            )}

            {podShipment && (
                <PodViewModal
                    shipmentId={podShipment.id}
                    trackingNumber={podShipment.trackingNumber}
                    onClose={() => setPodShipment(null)}
                />
            )}
        </div>
    );
}

export default DeliveryOperatorDashboard;