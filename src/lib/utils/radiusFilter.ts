// Utility functions for filtering items by radius

import { calculateDistance } from '@/lib/utils/location';

/**
 * Filter items by radius from a reference point
 * @param items Array of items with location coordinates
 * @param referenceLat Reference latitude
 * @param referenceLng Reference longitude
 * @param radiusKm Radius in kilometers
 * @returns Filtered array of items within radius
 */
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

/**
 * Sort items by distance from a reference point
 * @param items Array of items with location coordinates
 * @param referenceLat Reference latitude
 * @param referenceLng Reference longitude
 * @returns Sorted array of items by distance
 */
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

/**
 * Filter and sort items by radius and distance
 * @param items Array of items with location coordinates
 * @param referenceLat Reference latitude
 * @param referenceLng Reference longitude
 * @param radiusKm Radius in kilometers (0 for no radius filter)
 * @returns Filtered and sorted array of items
 */
export function filterAndSortByRadius<T extends { location?: { coordinates: [number, number] } }>(
  items: T[],
  referenceLat: number,
  referenceLng: number,
  radiusKm: number = 0
): T[] {
  // Filter by radius if specified
  let filteredItems = items;
  if (radiusKm > 0) {
    filteredItems = filterByRadius(items, referenceLat, referenceLng, radiusKm);
  }
  
  // Sort by distance
  return sortByDistance(filteredItems, referenceLat, referenceLng);
}

const radiusFilter = {
  filterByRadius,
  sortByDistance,
  filterAndSortByRadius
};

export default radiusFilter;