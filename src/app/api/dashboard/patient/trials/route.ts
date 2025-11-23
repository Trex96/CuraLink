import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';

export async function GET(_req: NextRequest) {
  void _req; // Unused parameter
  try {
    await connectDB();

    // Get the authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: Use patient location to filter nearby trials. For now, fetch a generic set.
    // Use the clinicaltrials service to fetch trials.
    const { searchTrials } = await import('@/lib/services/clinicaltrials');
    const trialsData = await searchTrials({}); // empty params fetch default set

    // Map ClinicalTrial to UI Trial shape
    const mappedTrials = trialsData.map((t) => ({
      _id: t.nctNumber,
      title: t.title,
      condition: t.conditions?.[0] || 'Various',
      phase: t.phase || 'N/A',
      status: t.status || 'Unknown',
      location: t.locations?.[0]
        ? {
          coordinates: t.locations[0].coordinates,
          address: t.locations[0].address,
        }
        : undefined,
      matchPercentage: Math.floor(Math.random() * 100), // placeholder for relevance
      distance: Math.round(Math.random() * 100), // placeholder distance
      importedFrom: 'clinicaltrials.gov' as const,
    }));

    return NextResponse.json(mappedTrials);
  } catch (error) {
    console.error('Error fetching trials:', error);
    // Fallback to mock data if external API fails
    const mockTrials = [
      {
        _id: '1',
        title: 'Novel Immunotherapy for Advanced Melanoma',
        condition: 'Melanoma',
        phase: 'II',
        status: 'Recruiting',
        location: {
          coordinates: [-76.6122, 39.2904],
          address: 'Baltimore, MD',
        },
        matchPercentage: 94,
        distance: 12.5,
        importedFrom: 'manual' as const,
      },
      {
        _id: '2',
        title: 'Cardiovascular Risk Reduction in Diabetics',
        condition: 'Diabetes',
        phase: 'III',
        status: 'Active',
        location: {
          coordinates: [-92.4696, 44.0213],
          address: 'Rochester, MN',
        },
        matchPercentage: 88,
        distance: 45.2,
        importedFrom: 'manual' as const,
      },
      {
        _id: '3',
        title: "Early Detection of Alzheimer's Biomarkers",
        condition: "Alzheimer's Disease",
        phase: 'I',
        status: 'Recruiting',
        location: {
          coordinates: [-81.6943, 41.5055],
          address: 'Cleveland, OH',
        },
        matchPercentage: 82,
        distance: 78.9,
        importedFrom: 'manual' as const,
      },
    ];
    return NextResponse.json(mockTrials);
  }
}