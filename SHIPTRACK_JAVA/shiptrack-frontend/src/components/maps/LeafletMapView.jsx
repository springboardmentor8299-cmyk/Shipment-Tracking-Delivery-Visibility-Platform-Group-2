import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow
});

const TRUCK_ICON_HTML = '<span style="font-size:28px;line-height:28px;">🚚</span>';

export default function LeafletMapView({
    source,
    destination,
    vehicle,
    route = [],
    reached = false,
    truck = null,
    truckArrived = false,
    travelled = []
}) {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const layersRef = useRef([]);

    useEffect(() => {
        if (!mapRef.current) return;

        if (!mapInstanceRef.current) {
            mapInstanceRef.current = L.map(mapRef.current).setView(
                source || destination || vehicle || truck || [28.6139, 77.209],
                7
            );
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(mapInstanceRef.current);
        }

        layersRef.current.forEach((layer) => layer.remove());
        layersRef.current = [];

        if (route.length > 1) {
            const routeLine = L.polyline(route, { color: "#0d6efd", weight: 4, opacity: 0.55 })
                .addTo(mapInstanceRef.current);
            layersRef.current.push(routeLine);
        } else if (source && destination) {
            const routeLine = L.polyline([source, destination], {
                color: "#0d6efd",
                weight: 3,
                dashArray: "8 6",
                opacity: 0.7
            }).addTo(mapInstanceRef.current);
            layersRef.current.push(routeLine);
        }

        if (travelled.length > 1) {
            const travelledLine = L.polyline(travelled, { color: "#198754", weight: 5 })
                .addTo(mapInstanceRef.current);
            layersRef.current.push(travelledLine);
        }

        if (source) {
            const marker = L.marker(source).addTo(mapInstanceRef.current).bindPopup("Source");
            layersRef.current.push(marker);
        }

        if (destination) {
            const marker = L.marker(destination).addTo(mapInstanceRef.current).bindPopup("Destination");
            layersRef.current.push(marker);
        }

        if (vehicle) {
            const marker = L.marker(vehicle).addTo(mapInstanceRef.current).bindPopup(
                reached ? "Reached destination" : "Vehicle live position"
            );
            layersRef.current.push(marker);
        }

        if (truck) {
            const truckIcon = L.divIcon({
                className: "truck-marker",
                html: TRUCK_ICON_HTML,
                iconSize: [28, 28],
                iconAnchor: [14, 14]
            });
            const marker = L.marker(truck, { icon: truckIcon, zIndexOffset: 1000 })
                .addTo(mapInstanceRef.current)
                .bindPopup(truckArrived ? "Destination reached" : "Truck en route");
            layersRef.current.push(marker);
        }

        const bounds = [...route, source, destination, vehicle, truck].filter(Boolean);

        if (bounds.length > 0) {
            mapInstanceRef.current.fitBounds(bounds, { padding: [30, 30] });
        }
    }, [source, destination, vehicle, route, reached, truck, truckArrived, travelled]);

    return <div ref={mapRef} style={{ width: "100%", height: "420px", borderRadius: "8px" }} />;
}
