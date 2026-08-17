import axios from "axios";

export const getRoute = async (start, end) => {

    try {

        const url =
            `https://router.project-osrm.org/route/v1/driving/` +
            `${start[1]},${start[0]};${end[1]},${end[0]}` +
            `?overview=full&geometries=geojson`;

        const response = await axios.get(url);

        if (
            !response.data.routes ||
            response.data.routes.length === 0
        ) {
            return [];
        }

        return response.data.routes[0].geometry.coordinates.map(
    ([lng, lat]) => [lat, lng]
);

    } catch (error) {

        console.error("Route Error:", error);

        return [];

    }

};