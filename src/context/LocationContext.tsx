'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentLocation, reverseGeocode } from '@/lib/utils/location';

interface LocationContextType {
  location: {
    lat: number;
    lng: number;
    address?: string;
  } | null;
  loading: boolean;
  error: string | null;
  getLocation: () => Promise<void>;
  hasPermission: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<LocationContextType['location']>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  const getLocation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const coords = await getCurrentLocation();
      setHasPermission(true);
      
      // Get address from coordinates
      let address: string | undefined;
      try {
        address = await reverseGeocode(coords.latitude, coords.longitude);
      } catch (addrError) {
        console.warn('Failed to get address:', addrError);
      }
      
      setLocation({
        lat: coords.latitude,
        lng: coords.longitude,
        address
      });
    } catch (err) {
      setHasPermission(false);
      setError(err instanceof Error ? err.message : 'Failed to get location');
      
      // Check if it's a permission error
      if (err instanceof Error && err.message.includes('denied')) {
        setError('Location permission denied. Please enable location access in your browser settings.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Try to get location on mount if permission was previously granted
  useEffect(() => {
    // We don't automatically request location on mount to avoid permission prompts
    // The user can manually trigger location access when needed
  }, []);

  return (
    <LocationContext.Provider
      value={{
        location,
        loading,
        error,
        getLocation,
        hasPermission
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}