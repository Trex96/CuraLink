// Convert degrees to radians
function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Calculate distance between two points using Haversine formula
export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

// Get user's current location using browser geolocation
export function getCurrentLocation(): Promise<GeolocationCoordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve(position.coords);
      },
      (error) => {
        reject(new Error(`Geolocation error: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
}

// Geocode address to coordinates using Google Maps Geocoding API
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!API_KEY) {
    throw new Error('Google Maps API key is not configured');
  }
  
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Geocoding API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat, lng };
    } else if (data.status === 'ZERO_RESULTS') {
      throw new Error('No results found for the provided address');
    } else {
      throw new Error(`Geocoding failed: ${data.status}`);
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    throw new Error(`Failed to geocode address: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Reverse geocode coordinates to address using Google Maps Geocoding API
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!API_KEY) {
    throw new Error('Google Maps API key is not configured');
  }
  
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Reverse geocoding API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      return data.results[0].formatted_address;
    } else if (data.status === 'ZERO_RESULTS') {
      throw new Error('No results found for the provided coordinates');
    } else {
      throw new Error(`Reverse geocoding failed: ${data.status}`);
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    throw new Error(`Failed to reverse geocode coordinates: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Get place suggestions using Google Places API
export async function getPlaceSuggestions(input: string): Promise<Array<{ description: string; placeId: string }>> {
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!API_KEY) {
    throw new Error('Google Maps API key is not configured');
  }
  
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Places API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.predictions) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return data.predictions.map((prediction: any) => ({
        description: prediction.description,
        placeId: prediction.place_id
      }));
    } else if (data.status === 'ZERO_RESULTS') {
      return [];
    } else {
      throw new Error(`Places API failed: ${data.status}`);
    }
  } catch (error) {
    console.error('Places API error:', error);
    throw new Error(`Failed to get place suggestions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Sort items by distance from a reference point
export function sortByDistance<T extends { location?: { coordinates: [number, number] } }>(
  items: T[],
  referenceLat: number,
  referenceLng: number
): T[] {
  return [...items].sort((a, b) => {
    if (!a.location || !b.location) return 0;
    
    const distanceA = calculateDistance(
      referenceLat,
      referenceLng,
      a.location.coordinates[1],
      a.location.coordinates[0]
    );
    
    const distanceB = calculateDistance(
      referenceLat,
      referenceLng,
      b.location.coordinates[1],
      b.location.coordinates[0]
    );
    
    return distanceA - distanceB;
  });
}

// Filter items by radius (in kilometers)
export function filterByRadius<T extends { location?: { coordinates: [number, number] } }>(
  items: T[],
  referenceLat: number,
  referenceLng: number,
  radiusKm: number
): T[] {
  return items.filter(item => {
    if (!item.location) return false;
    
    const distance = calculateDistance(
      referenceLat,
      referenceLng,
      item.location.coordinates[1],
      item.location.coordinates[0]
    );
    
    return distance <= radiusKm;
  });
}

// Convert miles to kilometers
export function milesToKilometers(miles: number): number {
  return miles * 1.60934;
}

// Convert kilometers to miles
export function kilometersToMiles(km: number): number {
  return km / 1.60934;
}

// Cache for geocoding results
const geocodeCache = new Map<string, { lat: number; lng: number; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Cached geocode address to coordinates
export async function cachedGeocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
  // Check cache first
  const cached = geocodeCache.get(address);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return { lat: cached.lat, lng: cached.lng };
  }
  
  // If not in cache or expired, fetch from API
  const result = await geocodeAddress(address);
  
  // Store in cache
  geocodeCache.set(address, { ...result, timestamp: Date.now() });
  
  return result;
}

// Cache for reverse geocoding results
const reverseGeocodeCache = new Map<string, { address: string; timestamp: number }>();

// Cached reverse geocode coordinates to address
export async function cachedReverseGeocode(lat: number, lng: number): Promise<string> {
  const key = `${lat},${lng}`;
  
  // Check cache first
  const cached = reverseGeocodeCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.address;
  }
  
  // If not in cache or expired, fetch from API
  const result = await reverseGeocode(lat, lng);
  
  // Store in cache
  reverseGeocodeCache.set(key, { address: result, timestamp: Date.now() });
  
  return result;
}