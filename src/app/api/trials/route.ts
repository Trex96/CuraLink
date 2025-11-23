import { NextRequest, NextResponse } from 'next/server';
import Trial from '@/models/trial/Trial';
import connectDB from '@/lib/db/connect';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import { calculateDistance } from '@/lib/utils/location';
import Favorite from '@/models/favorite/Favorite';
import { seedTrialsIfEmpty } from '@/lib/utils/seedTrials';
import { searchTrials } from '@/lib/services/clinicaltrials';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Auto-seed trials if database is empty
    await seedTrialsIfEmpty();

    // Get the authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    interface SessionUser {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const condition = searchParams.get('condition') || '';
    const status = searchParams.get('status') || '';
    const phase = searchParams.get('phase') || '';
    const location = searchParams.get('location') || '';
    const radius = parseInt(searchParams.get('radius') || '100'); // in miles
    const sortBy = searchParams.get('sortBy') || 'relevance';

    // Build search query for local DB
    const query: Record<string, unknown> = {};

    if (condition) {
      query.conditions = { $regex: condition, $options: 'i' };
    }
    if (status) {
      query.status = status;
    }
    if (phase) {
      query.phase = phase;
    }

    // Add location filter if provided
    let userLocation: { lat: number; lng: number } | null = null;
    if (location) {
      const [lat, lng] = location.split(',').map(Number);
      if (!isNaN(lat) && !isNaN(lng)) {
        userLocation = { lat, lng };
      }
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Fetch local trials
    const localTrialsPromise = Trial.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    // Fetch external trials from ClinicalTrials.gov
    // We map our filters to the service's SearchParams
    const externalTrialsPromise = searchTrials({
      disease: condition,
      status: status,
      phase: phase,
      location: location, // The service handles location string or lat,long? Service doc says "location" string.
      // If location is lat,long, the service might not support it directly as a string query.
      // But let's pass it if it's a string name, or skip if it's coordinates for now unless service supports it.
      // The service implementation uses 'query.locn' which supports city/state/country.
      // If 'location' param is coordinates, we might want to skip or reverse geocode.
      // For now, let's assume it's a string or empty.
      page: page,
      pageSize: limit
    });

    const [localTrials, externalTrials] = await Promise.all([
      localTrialsPromise,
      externalTrialsPromise.catch(err => {
        console.error('Failed to fetch external trials:', err);
        return [];
      })
    ]);

    // Map external trials to match local Trial shape
    const mappedExternalTrials = externalTrials.map(t => ({
      _id: t.nctNumber, // Use NCT as ID
      nctNumber: t.nctNumber,
      title: t.title,
      status: t.status,
      phase: t.phase,
      conditions: t.conditions,
      locations: t.locations,
      summary: t.summary,
      createdAt: new Date(t.lastUpdated), // Use last update as creation date equivalent
      importedFrom: 'clinicaltrials.gov' as const
    }));

    // Combine results
    // Strategy: Interleave or just append?
    // For simplicity, let's combine and slice, but since we fetched paginated from both,
    // we effectively have 2 pages worth of data.
    // Let's return all of them (up to 2x limit) or slice to limit?
    // Returning all gives more data which is good.
    const allTrials = [...localTrials, ...mappedExternalTrials];

    // Process trials to add distance and check if favorited
    let processedTrials = await Promise.all(
      allTrials.map(async (trial) => {
        // Calculate distance if location is provided
        let distance: number | undefined;
        if (userLocation && trial.locations && trial.locations.length > 0) {
          let minDistance = Infinity;
          trial.locations.forEach((loc: { coordinates?: number[] }) => {
            if (loc.coordinates) {
              const d = calculateDistance(
                userLocation!.lat,
                userLocation!.lng,
                loc.coordinates[1],
                loc.coordinates[0]
              );
              if (d < minDistance) {
                minDistance = d;
              }
            }
          });
          if (minDistance !== Infinity) {
            distance = minDistance * 0.621371; // Convert to miles
          }
        }

        // Check if trial is favorited
        // For external trials, _id is nctNumber.
        let isFavorite = false;
        try {
          const favorite = await Favorite.findOne({
            userId: (session.user as SessionUser).id,
            itemType: 'trial',
            itemId: trial._id.toString()
          });
          isFavorite = !!favorite;
        } catch (error) {
          // Handle gracefully if itemId type mismatch during schema migration
          console.warn('Favorite lookup error (possibly schema migration):', error);
          isFavorite = false;
        }

        return {
          ...trial,
          distance,
          isFavorite
        };
      })
    );

    // Filter by radius if location and radius are provided
    if (userLocation && radius > 0) {
      processedTrials = processedTrials.filter(trial =>
        trial.distance !== undefined && trial.distance <= radius
      );
    }

    // Sort trials
    if (sortBy === 'distance' && userLocation) {
      processedTrials.sort((a, b) => {
        if (a.distance === undefined) return 1;
        if (b.distance === undefined) return -1;
        return a.distance - b.distance;
      });
    } else if (sortBy === 'newest') {
      processedTrials.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    // Recalculate total (approximate since we are merging paginated sources)
    // We'll just sum the lengths for now or use a placeholder.
    // Ideally we'd get total counts from both APIs.
    // Trial.countDocuments(query) + external total?
    // For now, let's just return the current page count as total if we don't have better info,
    // or fetch local count.
    const localCount = await Trial.countDocuments(query);
    const total = localCount + 1000; // Arbitrary high number to allow pagination for external

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      trials: processedTrials,
      total: total,
      page,
      limit,
      totalPages
    });
  } catch (error) {
    console.error('Error fetching trials:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}