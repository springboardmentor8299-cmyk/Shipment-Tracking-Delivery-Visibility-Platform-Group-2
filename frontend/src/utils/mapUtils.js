// Helper function to sanitize coordinate order [lat, lng]
export function sanitizeLatLng(lat, lng, defaultLat = 28.6139, defaultLng = 77.2090) {
  let parsedLat = parseFloat(lat);
  let parsedLng = parseFloat(lng);

  if (isNaN(parsedLat) || isNaN(parsedLng)) {
    return [defaultLat, defaultLng];
  }

  // Detect swapped Lat/Lng pair: Lat must be between -90 and 90. If parsedLat > 90 or < -90, swap!
  if (Math.abs(parsedLat) > 90 && Math.abs(parsedLng) <= 90) {
    const temp = parsedLat;
    parsedLat = parsedLng;
    parsedLng = temp;
    console.warn(`[Map Correction] Swapped inverted [lng, lat] to [lat, lng]: [${parsedLat}, ${parsedLng}]`);
  }

  return [parsedLat, parsedLng];
}
