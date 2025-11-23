import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/user/User';
import Trial from '@/models/trial/Trial';
import { calculateDistance, milesToKilometers, kilometersToMiles } from '@/lib/utils/location';
import connectDB from '@/lib/db/connect';

interface Location {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  address?: string;
}

interface Researcher {
  _id: string;
  firstName: string;
  lastName: string;
  institution: string;
  role: string;
  location?: Location;
  distance?: number;
}

interface TrialLocation {
  coordinates: [number, number];
  address?: string;
}

interface Trial {
  _id: string;
  title: string;
  nctNumber: string;
  status: string;
  locations: TrialLocation[];
  distance?: number;
  closestLocation?: TrialLocation;
}

interface ResearcherWithDistance extends Researcher {
  distance: number;
}

interface TrialWithDistance extends Trial {
  distance: number;
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');
    const type = searchParams.get('type') || 'researchers';
    const limit = parseInt(searchParams.get('limit') || '10');
    const radiusMiles = parseFloat(searchParams.get('radius') || '0'); // Radius in miles
    const sortBy = searchParams.get('sortBy') || 'distance'; // distance or relevance
    
    // Validate required parameters
    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }
    
    // Validate latitude and longitude ranges
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        { error: 'Invalid latitude or longitude values' },
        { status: 400 }
      );
    }
    
    // Validate limit
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 100' },
        { status: 400 }
      );
    }
    
    // Validate type
    if (type !== 'researchers' && type !== 'trials') {
      return NextResponse.json(
        { error: 'Type must be either researchers or trials' },
        { status: 400 }
      );
    }
    
    // Validate sortBy
    if (sortBy !== 'distance' && sortBy !== 'relevance') {
      return NextResponse.json(
        { error: 'SortBy must be either distance or relevance' },
        { status: 400 }
      );
    }
    
    // Convert radius from miles to kilometers if provided
    const radiusKm = radiusMiles > 0 ? milesToKilometers(radiusMiles) : 0;
    
    let results: (ResearcherWithDistance | TrialWithDistance)[] = [];
    
    if (type === 'researchers') {
      // Find researchers with locations
      const query = {
        role: 'researcher',
        'location.coordinates': { $exists: true }
      };
      
      const researchers = await User.find(query).lean() as unknown as Researcher[];
      
      // Calculate distances and filter by radius if specified
      const researchersWithDistance = researchers
        .map(researcher => {
          if (!researcher.location) {
            return { ...researcher, distance: Infinity } as ResearcherWithDistance;
          }
          
          const distance = calculateDistance(
            lat,
            lng,
            researcher.location.coordinates[1],
            researcher.location.coordinates[0]
          );
          
          return { ...researcher, distance } as ResearcherWithDistance;
        })
        .filter(researcher => {
          // If radius is specified, filter by it
          if (radiusKm > 0) {
            return researcher.distance <= radiusKm;
          }
          return true;
        });
      
      // Sort by distance or relevance
      if (sortBy === 'distance') {
        results = researchersWithDistance.sort((a, b) => a.distance - b.distance);
      } else {
        // For relevance, we'll sort by a combination of distance and other factors
        // In a real implementation, this would be more complex
        results = researchersWithDistance.sort((a, b) => a.distance - b.distance);
      }
      
      // Limit results
      results = results.slice(0, limit);
      
      // Add distance in miles for display
      results = results.map(researcher => ({
        ...researcher,
        distanceMiles: kilometersToMiles(researcher.distance)
      }));
    } else if (type === 'trials') {
      // Find trials with locations
      const query = {
        'locations.coordinates': { $exists: true }
      };
      
      const trials = await Trial.find(query).lean() as unknown as Trial[];
      
      // Calculate distances and filter by radius if specified
      const trialsWithDistance: TrialWithDistance[] = [];
      
      trials.forEach(trial => {
        // For trials, find the closest location
        let minDistance = Infinity;
        let closestLocation = null;
        
        trial.locations.forEach(loc => {
          const distance = calculateDistance(
            lat,
            lng,
            loc.coordinates[1],
            loc.coordinates[0]
          );
          if (distance < minDistance) {
            minDistance = distance;
            closestLocation = loc;
          }
        });
        
        // Only add to results if within radius (if specified)
        if (radiusKm === 0 || minDistance <= radiusKm) {
          trialsWithDistance.push({ 
            ...trial, 
            distance: minDistance,
            closestLocation: closestLocation || undefined
          } as TrialWithDistance);
        }
      });
      
      // Sort by distance or relevance
      if (sortBy === 'distance') {
        results = trialsWithDistance.sort((a, b) => a.distance - b.distance);
      } else {
        // For relevance, we'll sort by a combination of distance and other factors
        // In a real implementation, this would be more complex
        results = trialsWithDistance.sort((a, b) => a.distance - b.distance);
      }
      
      // Limit results
      results = results.slice(0, limit);
      
      // Add distance in miles for display
      results = results.map(trial => ({
        ...trial,
        distanceMiles: kilometersToMiles(trial.distance)
      }));
    }
    
    return NextResponse.json(results);
  } catch (error: unknown) {
    console.error('Nearest location error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nearest locations' },
      { status: 500 }
    );
  }
}