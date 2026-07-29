import { lazy, Suspense, useEffect, useState } from "react";
import DashboardNavbar from "../../components/dashboard/DashboardNavbar";
import WelcomeCard from "../../components/dashboard/WelcomeCard";
import StatCard from "../../components/dashboard/StatCard";
import QuickActions from "../../components/dashboard/QuickActions";
import RecentShipments from "../../components/dashboard/RecentShipments";
import DeliveryProgress from "../../components/dashboard/DeliveryProgress";
import ShipmentChart from "../../components/dashboard/ShipmentChart";
import { fetchStats } from "../../services/shipmentService";

const AdminLiveTracking = lazy(() => import("../../components/dashboard/AdminLiveTracking"));

function Dashboard() {

    const [stats, setStats] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const loadStats = async () => {

        console.log(`[Dashboard] loadStats called (refreshKey=${refreshKey})`);
        try {

            const data = await fetchStats();
            console.log(`[Dashboard] Stats received:`, JSON.stringify(data));
            setStats(data);

        } catch (err) {

            console.error(`[Dashboard] Stats fetch failed:`, err);
            setStats(null);

        }

    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadStats();
    }, [refreshKey]);

    const handleDataChanged = () => {
        console.log(`[Dashboard] handleDataChanged: refreshKey=${refreshKey + 1}`);
        setRefreshKey((prev) => prev + 1);
    };

    return (
        <div className="dashboard-page">

            <DashboardNavbar />

            <div className="container py-5">

                <WelcomeCard />

                <div className="row mt-4 g-4">

                    <div className="col-lg-8">

                        <div className="row g-4">

                            <div className="col-md-4">
                                <StatCard
                                    icon="bi-box-seam"
                                    title="Total Shipments"
                                    value={stats?.total ?? 0}
                                    color="#0F4C81"
                                />
                            </div>

                            <div className="col-md-4">
                                <StatCard
                                    icon="bi-truck"
                                    title="In Transit"
                                    value={stats?.inTransit ?? 0}
                                    color="#2563EB"
                                />
                            </div>

                            <div className="col-md-4">
                                <StatCard
                                    icon="bi-geo-alt"
                                    title="Out for Delivery"
                                    value={stats?.outForDelivery ?? 0}
                                    color="#0EA5E9"
                                />
                            </div>

                            <div className="col-md-4">
                                <StatCard
                                    icon="bi-check-circle"
                                    title="Delivered"
                                    value={stats?.delivered ?? 0}
                                    color="#16A34A"
                                />
                            </div>

                            <div className="col-md-4">
                                <StatCard
                                    icon="bi-clock-history"
                                    title="Pending"
                                    value={stats?.created ?? 0}
                                    color="#F59E0B"
                                />
                            </div>

                            <div className="col-md-4">
                                <StatCard
                                    icon="bi-x-circle"
                                    title="Cancelled"
                                    value={stats?.cancelled ?? 0}
                                    color="#EF4444"
                                />
                            </div>

                        </div>

                    </div>

                    <div className="col-lg-4">

                        <QuickActions onShipmentCreated={handleDataChanged} />

                    </div>


                </div>
                <div className="mt-5">

                    <RecentShipments onDataChanged={handleDataChanged} />

                </div>
                <div className="row mt-5 g-4">

                    <div className="col-lg-4">

                        <DeliveryProgress stats={stats} />

                    </div>

                    <div className="col-lg-8">

                        <ShipmentChart stats={stats} />

                    </div>

                </div>
                <div className="mt-5">
                    <Suspense fallback={<div className="text-center py-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading live tracking...</span></div></div>}>
                        <AdminLiveTracking />
                    </Suspense>
                </div>

            </div>

        </div>
    );
}

export default Dashboard;
