const CACHE = new Map();

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchGeocode = async (query, timeoutMs) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=1`,
            {
                headers: {
                    "Accept-Language": "en"
                },
                signal: controller.signal
            }
        );
        return response;
    } finally {
        clearTimeout(timer);
    }
};

const buildCandidates = (address) => {
    const parts = address
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);
    const candidates = [];
    for (let i = 0; i < parts.length; i += 1) {
        const candidate = parts.slice(i).join(", ");
        if (candidate.length >= 4 && !candidates.includes(candidate)) {
            candidates.push(candidate);
        }
    }
    return candidates.slice(0, 3);
};

const parseResult = (data) => {
    const place = data && data[0];
    if (place && place.lat != null && place.lon != null) {
        return { lat: Number(place.lat), lng: Number(place.lon) };
    }
    return null;
};

const geocodeCandidate = async (query, timeoutMs) => {
    for (let attempt = 0; attempt < 3; attempt += 1) {
        let response = null;
        try {
            response = await fetchGeocode(query, timeoutMs);
        } catch {
            
        }
        if (response && response.ok) {
            try {
                return parseResult(await response.json());
            } catch {
                
            }
        }
        if (attempt < 2) {
            const rateLimited = response
                && (response.status === 429 || response.status === 403);
            await delay(rateLimited ? 1300 : 700);
        }
    }
    return null;
};

const geocodeAddress = async (address, timeoutMs = 12000) => {
    const normalized = String(address || "").trim();
    if (!normalized) {
        return null;
    }
    if (CACHE.has(normalized)) {
        return CACHE.get(normalized);
    }
    let result = null;
    for (const candidate of buildCandidates(normalized)) {
        result = await geocodeCandidate(candidate, timeoutMs);
        if (result) {
            break;
        }
    }
    if (result) {
        CACHE.set(normalized, result);
    }
    return result;
};

export const resolveSourceDestination = async (shipment) => {
    if (!shipment) {
        return { source: null, destination: null };
    }

    const hasSourceCoords = shipment.sourceLatitude != null
        && shipment.sourceLongitude != null;
    const hasDestinationCoords = shipment.destinationLatitude != null
        && shipment.destinationLongitude != null;

    const [source, destination] = await Promise.all([
        hasSourceCoords
            ? { lat: shipment.sourceLatitude, lng: shipment.sourceLongitude }
            : geocodeAddress(shipment.sourceAddress),
        hasDestinationCoords
            ? { lat: shipment.destinationLatitude, lng: shipment.destinationLongitude }
            : geocodeAddress(shipment.destinationAddress)
    ]);

    return { source, destination };
};
