import { createContext, useContext, useState, type ReactNode } from 'react';

export interface Coordinates {
  lat: number;
  lon: number;
}

interface LocationContextType {
  userLocation: Coordinates | null;
  locationLabel: string | null;
  locationSource: 'gps' | 'manual' | null;
  isLocating: boolean;
  locationError: string | null;
  requestLocation: () => void;
  setManualLocation: (lat: number, lon: number, label: string) => void;
  clearLocation: () => void;
  calculateDistance: (lat: number | null, lon: number | null) => number | null;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [locationLabel, setLocationLabel] = useState<string | null>(null);
  const [locationSource, setLocationSource] = useState<'gps' | 'manual' | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const requestLocation = () => {
    setIsLocating(true);
    setLocationError(null);

    if (!('geolocation' in navigator)) {
      setLocationError("O seu navegador não suporta geolocalização.");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ lat: position.coords.latitude, lon: position.coords.longitude });
        setLocationLabel("A Minha Localização (GPS)");
        setLocationSource('gps');
        setIsLocating(false);
      },
      (error) => {
        let errorMessage = "Erro ao obter localização.";
        if (error.code === 1) errorMessage = "Acesso à localização recusado.";
        if (error.code === 2) errorMessage = "Sinal de GPS indisponível.";
        setLocationError(errorMessage);
        setIsLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  };

  const setManualLocation = (lat: number, lon: number, label: string) => {
    setUserLocation({ lat, lon });
    setLocationLabel(label);
    setLocationSource('manual');
    setLocationError(null);
  };

  const clearLocation = () => {
    setUserLocation(null);
    setLocationLabel(null);
    setLocationSource(null);
    setLocationError(null);
  };

  const calculateDistance = (targetLat: number | null, targetLon: number | null): number | null => {
    if (!userLocation || !targetLat || !targetLon) return null;
    const R = 6371; // Earth's radius in km
    const dLat = (targetLat - userLocation.lat) * (Math.PI / 180);
    const dLon = (targetLon - userLocation.lon) * (Math.PI / 180);
    const lat1 = userLocation.lat * (Math.PI / 180);
    const lat2 = targetLat * (Math.PI / 180);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const value = {
    userLocation, locationLabel, locationSource, isLocating, locationError,
    requestLocation, setManualLocation, clearLocation, calculateDistance
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export const useUserLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) throw new Error('useUserLocation must be used within LocationProvider');
  return context;
};