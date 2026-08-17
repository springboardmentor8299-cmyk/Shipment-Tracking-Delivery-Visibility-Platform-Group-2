import { useState, useEffect, useCallback, useRef } from 'react';

export interface LiveLocationState {
  lat: number | null;
  lng: number | null;
  accuracy: number | null; // meters
  altitude: number | null;
  heading: number | null;
  speedKmH: number | null;
  timestamp: string | null;
  isTracking: boolean;
  loading: boolean;
  error: string | null;
}

export const formatLatitude = (lat: number | null): string => {
  if (lat === null || lat === undefined || isNaN(lat)) return 'N/A';
  const dir = lat >= 0 ? 'N' : 'S';
  return `${Math.abs(lat).toFixed(6)}° ${dir}`;
};

export const formatLongitude = (lng: number | null): string => {
  if (lng === null || lng === undefined || isNaN(lng)) return 'N/A';
  const dir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lng).toFixed(6)}° ${dir}`;
};

export const useLiveLocation = (initialLat?: number, initialLng?: number) => {
  const [location, setLocation] = useState<LiveLocationState>({
    lat: initialLat ?? null,
    lng: initialLng ?? null,
    accuracy: null,
    altitude: null,
    heading: null,
    speedKmH: null,
    timestamp: null,
    isTracking: false,
    loading: false,
    error: null,
  });

  const watchIdRef = useRef<number | null>(null);

  // Single fetch function
  const fetchCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        error: 'Geolocation is not supported by your browser.',
        loading: false,
      }));
      return;
    }

    setLocation(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy, altitude, heading, speed } = position.coords;
        const speedInKmH = speed !== null ? Math.round(speed * 3.6) : null;
        const now = new Date().toLocaleTimeString();

        setLocation({
          lat: latitude,
          lng: longitude,
          accuracy: accuracy ? Math.round(accuracy) : 10,
          altitude: altitude ? Math.round(altitude) : null,
          heading: heading ? Math.round(heading) : null,
          speedKmH: speedInKmH,
          timestamp: now,
          isTracking: false,
          loading: false,
          error: null,
        });
      },
      (err) => {
        let msg = 'Failed to fetch device location.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Geolocation permission denied. Please allow location access in your browser.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'Location position unavailable from device GPS.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out.';
        }
        
        setLocation(prev => ({
          ...prev,
          loading: false,
          error: msg,
          // Fallback demo coordinates if permission denied
          lat: prev.lat ?? 19.076045,
          lng: prev.lng ?? 72.877712,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  // Toggle watch position
  const toggleLiveTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setLocation(prev => ({ ...prev, isTracking: false }));
    } else {
      if (!navigator.geolocation) {
        setLocation(prev => ({ ...prev, error: 'Geolocation not supported.' }));
        return;
      }

      setLocation(prev => ({ ...prev, isTracking: true, loading: true, error: null }));

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy, altitude, heading, speed } = position.coords;
          const speedInKmH = speed !== null ? Math.round(speed * 3.6) : null;
          const now = new Date().toLocaleTimeString();

          setLocation({
            lat: latitude,
            lng: longitude,
            accuracy: accuracy ? Math.round(accuracy) : 8,
            altitude: altitude ? Math.round(altitude) : null,
            heading: heading ? Math.round(heading) : null,
            speedKmH: speedInKmH,
            timestamp: now,
            isTracking: true,
            loading: false,
            error: null,
          });
        },
        (err) => {
          setLocation(prev => ({
            ...prev,
            loading: false,
            error: 'Live GPS stream signal lost or denied.',
            isTracking: false,
          }));
          if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 2000,
        }
      );
    }
  }, []);

  // Set manual location override
  const setManualCoords = useCallback((lat: number, lng: number) => {
    const now = new Date().toLocaleTimeString();
    setLocation({
      lat,
      lng,
      accuracy: 5,
      altitude: null,
      heading: null,
      speedKmH: 0,
      timestamp: now,
      isTracking: false,
      loading: false,
      error: null,
    });
  }, []);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    ...location,
    fetchCurrentLocation,
    toggleLiveTracking,
    setManualCoords,
  };
};
