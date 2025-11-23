// Location service for Google Maps integration
import { 
  cachedGeocodeAddress, 
  cachedReverseGeocode, 
  calculateDistance, 
  getPlaceSuggestions,
  filterByRadius,
  sortByDistance
} from '@/lib/utils/location';

// Interface for location coordinates
export interface Coordinates {
  lat: number;
  lng: number;
}

// Interface for place suggestions
export interface PlaceSuggestion {
  description: string;
  placeId: string;
}

// Interface for location-aware items
export interface LocationItem {
  location?: {
    coordinates: [number, number]; // [longitude, latitude]
  };
}

/**
 * Geocode an address to coordinates with caching
 * @param address The address to geocode
 * @returns Promise resolving to coordinates
 */
export async function geocodeAddress(address: string): Promise<Coordinates> {
  try {
    return await cachedGeocodeAddress(address);
  } catch (error) {
    console.error('Geocoding service error:', error);
    throw new Error(`Failed to geocode address: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Reverse geocode coordinates to an address with caching
 * @param lat Latitude
 * @param lng Longitude
 * @returns Promise resolving to formatted address
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    return await cachedReverseGeocode(lat, lng);
  } catch (error) {
    console.error('Reverse geocoding service error:', error);
    throw new Error(`Failed to reverse geocode coordinates: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Calculate distance between two points using Haversine formula
 * @param point1 First point coordinates
 * @param point2 Second point coordinates
 * @returns Distance in kilometers
 */
export function calculateDistanceBetweenPoints(
  point1: Coordinates, 
  point2: Coordinates
): number {
  return calculateDistance(point1.lat, point1.lng, point2.lat, point2.lng);
}

/**
 * Get place suggestions for autocomplete
 * @param input Partial address or place name
 * @returns Promise resolving to array of place suggestions
 */
export async function getPlaceSuggestionsForInput(input: string): Promise<PlaceSuggestion[]> {
  try {
    return await getPlaceSuggestions(input);
  } catch (error) {
    console.error('Place suggestions service error:', error);
    throw new Error(`Failed to get place suggestions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Filter items by radius from a reference point
 * @param items Array of location-aware items
 * @param referencePoint Reference coordinates
 * @param radiusKm Radius in kilometers
 * @returns Filtered array of items within radius
 */
export function filterItemsByRadius<T extends LocationItem>(
  items: T[],
  referencePoint: Coordinates,
  radiusKm: number
): T[] {
  return filterByRadius(
    items,
    referencePoint.lat,
    referencePoint.lng,
    radiusKm
  );
}

/**
 * Sort items by distance from a reference point
 * @param items Array of location-aware items
 * @param referencePoint Reference coordinates
 * @returns Sorted array of items by distance
 */
export function sortItemsByDistance<T extends LocationItem>(
  items: T[],
  referencePoint: Coordinates
): T[] {
  return sortByDistance(
    items,
    referencePoint.lat,
    referencePoint.lng
  );
}

const locationService = {
  geocodeAddress,
  reverseGeocode,
  calculateDistanceBetweenPoints,
  getPlaceSuggestionsForInput,
  filterItemsByRadius,
  sortItemsByDistance
};

export default locationService;