import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/axiosConfig";
import { getRouteByShipment, getRouteSummary } from "../../api/routeApi";
import { resolveSourceDestination } from "../../api/geocode";

const EMPTY = {
    loading: false,
    points: [],
    summary: null,
    shipment: null,
    coords: { source: null, destination: null }
};

const authConfig = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
    }
});

const useRouteDetails = (shipmentId, trackingNumber) => {
    const [data, setData] = useState({ key: null, ...EMPTY });

    useEffect(() => {
        if (!shipmentId) {
            return undefined;
        }
        let cancelled = false;

        const load = async () => {
            try {
                const [routeRes, summaryRes, shipmentRes] = await Promise.all([
                    getRouteByShipment(shipmentId),
                    getRouteSummary(shipmentId),
                    trackingNumber
                        ? api.get(
                            `/shipments/tracking/${encodeURIComponent(trackingNumber)}`,
                            authConfig()
                        ).catch(() => null)
                        : Promise.resolve(null)
                ]);
                const shipment = shipmentRes?.data || null;
                const coords = await resolveSourceDestination(shipment);
                if (cancelled) {
                    return;
                }
                setData({
                    key: shipmentId,
                    loading: false,
                    points: routeRes.data || [],
                    summary: summaryRes.data || null,
                    shipment,
                    coords
                });
            } catch (error) {
                if (!cancelled) {
                    toast.error(
                        error.response?.data?.message ||
                        "Failed to load route details."
                    );
                    setData({
                        key: shipmentId,
                        loading: false,
                        points: [],
                        summary: null,
                        shipment: null,
                        coords: { source: null, destination: null }
                    });
                }
            }
        };

        load();

        return () => {
            cancelled = true;
        };
    }, [shipmentId, trackingNumber]);

    const current = data.key === shipmentId
        ? data
        : { ...EMPTY, key: shipmentId, loading: Boolean(shipmentId) };

    return current;
};

export default useRouteDetails;
