import axios from "axios";

export async function getCoordinates(address) {

    try {

        const response = await axios.get(
            "https://nominatim.openstreetmap.org/search",
            {
                params: {
                    q: address,
                    format: "json",
                    limit: 1
                }
            }
        );

        if (response.data.length === 0) {
            return null;
        }

        return {
            latitude: parseFloat(response.data[0].lat),
            longitude: parseFloat(response.data[0].lon)
        };

    } catch (error) {

        console.error(error);

        return null;

    }

}