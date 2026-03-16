"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
}

const LocationContext = createContext<LocationState>({
  latitude: null,
  longitude: null,
  error: null,
  loading: true,
});

export function useLocation() {
  return useContext(LocationContext);
}

export function LocationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({
        latitude: null,
        longitude: null,
        error: "Geolocation is not supported by your browser",
        loading: false,
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          loading: false,
        });
      },
      (error) => {
        // Default to Cape Town if geolocation fails
        setState({
          latitude: -33.9249,
          longitude: 18.4241,
          error: error.message,
          loading: false,
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return (
    <LocationContext.Provider value={state}>{children}</LocationContext.Provider>
  );
}
