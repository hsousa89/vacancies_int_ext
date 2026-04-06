import { useState } from 'react';

export interface Coordinates {
  lat: number;
  lon: number;
}

export function useUserLocation() {
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
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
        setUserLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setIsLocating(false);
      },
      (error) => {
        let errorMessage = "Erro desconhecido ao obter localização.";
        if (error.code === 1) errorMessage = "Acesso à localização recusado.";
        if (error.code === 2) errorMessage = "Sinal de GPS indisponível.";
        if (error.code === 3) errorMessage = "O pedido de localização expirou.";
        setLocationError(errorMessage);
        setIsLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Haversine formula to calculate distance in KM
  const calculateDistance = (targetLat: number | null, targetLon: number | null): number | null => {
    if (!userLocation || !targetLat || !targetLon) return null;

    const R = 6371; // Earth's radius in km
    const dLat = (targetLat - userLocation.lat) * (Math.PI / 180);
    const dLon = (targetLon - userLocation.lon) * (Math.PI / 180);
    const lat1 = userLocation.lat * (Math.PI / 180);
    const lat2 = targetLat * (Math.PI / 180);

    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return { userLocation, isLocating, locationError, requestLocation, calculateDistance };
}