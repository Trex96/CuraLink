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
    // 2. Find publications related to those conditions
    // 3. Filter for patient-friendly content
    // 4. Sort by relevance/recency
    
    // For now, we'll return mock data with realistic structure
    const mockPublications = [
      {
        _id: '1',
        title: 'Understanding Your Diagnosis: A Patient Guide to Modern Treatment Options',
        authors: ['Dr. Emily Johnson', 'Dr. Michael Chen'],
        journal: 'Patient Education and Counseling',
        publicationDate: '2023-05-15T00:00:00.000Z',
        matchPercentage: 96
      },
      {
        _id: '2',
        title: 'Living Well with Chronic Conditions: Lifestyle Strategies That Work',
        authors: ['Sarah Williams', 'Dr. Robert Brown'],
        journal: 'Journal of Patient Experience',
        publicationDate: '2023-03-22T00:00:00.000Z',
        matchPercentage: 89
      },
      {
        _id: '3',
        title: 'The Future of Personalized Medicine: What It Means for You',
        authors: ['Dr. Jennifer Lee', 'Dr. David Kim'],
        journal: 'Nature Reviews Drug Discovery',
        publicationDate: '2023-01-10T00:00:00.000Z',
        matchPercentage: 84
      }
    ];
    
    return NextResponse.json(mockPublications);
  } catch (error) {
    console.error('Error fetching publications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}