import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ZodSchema } from 'zod';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function validateAndSanitize<T>(schema: ZodSchema<T>, data: unknown): T {
  try {
    const validatedData = schema.parse(data);
    return validatedData;
  } catch (error) {
    throw new Error(`Validation failed: ${error}`);
  }
}

export function calculateMatchingPercentage(userProfile: any, trial: any): number {
  // This is a simplified matching algorithm
  // In a real application, this would be more complex
  let score = 0;
  const totalScore = 100;

  // Example matching criteria
  if (userProfile.diseaseCategory === trial.diseaseCategory) {
    score += 30;
  }

  if (userProfile.location && trial.location) {
    // Calculate distance and adjust score based on proximity
    const distance = calculateDistance(
      userProfile.location.coordinates[1],
      userProfile.location.coordinates[0],
      trial.location.coordinates[1],
      trial.location.coordinates[0]
    );
    
    if (distance < 50) {
      score += 20;
    } else if (distance < 100) {
      score += 10;
    }
  }

  // Age matching
  if (userProfile.age && trial.eligibilityCriteria.includes('age')) {
    score += 15;
  }

  // Gender matching
  if (userProfile.gender && trial.eligibilityCriteria.includes('gender')) {
    score += 10;
  }

  return Math.min(score, totalScore);
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}
