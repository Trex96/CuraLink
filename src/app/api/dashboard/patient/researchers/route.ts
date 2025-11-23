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
    
    // In a real implementation, we would:
    // 1. Get the patient's conditions/interests from their profile
    // 2. Find researchers with expertise in those areas
    // 3. Sort by relevance/match percentage
    
    // For now, we'll return mock data with realistic structure
    const mockResearchers = [
      {
        _id: '1',
        firstName: 'Dr. Emily',
        lastName: 'Johnson',
        institution: 'Johns Hopkins Hospital',
        specialty: 'Oncology',
        location: {
          coordinates: [-76.6122, 39.2904],
          address: 'Baltimore, MD'
        },
        matchPercentage: 92
      },
      {
        _id: '2',
        firstName: 'Dr. Michael',
        lastName: 'Chen',
        institution: 'Mayo Clinic',
        specialty: 'Cardiology',
        location: {
          coordinates: [-92.4696, 44.0213],
          address: 'Rochester, MN'
        },
        matchPercentage: 87
      },
      {
        _id: '3',
        firstName: 'Dr. Sarah',
        lastName: 'Williams',
        institution: 'Cleveland Clinic',
        specialty: 'Neurology',
        location: {
          coordinates: [-81.6943, 41.5055],
          address: 'Cleveland, OH'
        },
        matchPercentage: 85
      }
    ];
    
    return NextResponse.json(mockResearchers);
  } catch (error) {
    console.error('Error fetching researchers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}