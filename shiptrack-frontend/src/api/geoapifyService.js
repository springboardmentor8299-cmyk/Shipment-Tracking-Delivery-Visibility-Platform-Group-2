import axios from "axios";

const API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;

export const searchAddress = async (text) => {
    if (!text || text.trim().length < 3) {
        return [];
    }

    try {
        const response = await axios.get(
            "https://api.geoapify.com/v1/geocode/autocomplete",
            {
                params: {
                    text,
                    limit: 5,
                    apiKey: API_KEY
                }
            }
        );

        return response.data.features.map((feature) => ({
            address: feature.properties.formatted,
            latitude: feature.properties.lat,
            longitude: feature.properties.lon
        }));
    } catch (error) {
        console.error("Geoapify search failed:", error);
        return [];
    }
};