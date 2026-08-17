import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";

function RoutingMachine({ currentLocation, destinationLocation }) {

    const map = useMap();

    useEffect(() => {

        const routingControl = L.Routing.control({

            waypoints: [
                L.latLng(currentLocation[0], currentLocation[1]),
                L.latLng(destinationLocation[0], destinationLocation[1])
            ],

            lineOptions: {
                styles: [
                    {
                        color: "#2563eb",
                        weight: 6
                    }
                ]
            },

            addWaypoints: false,
            draggableWaypoints: false,
            fitSelectedRoutes: true,
            show: false,

            createMarker: () => null

        }).addTo(map);

        return () => {
            map.removeControl(routingControl);
        };

    }, [map, currentLocation, destinationLocation]);

    return null;
}

export default RoutingMachine;