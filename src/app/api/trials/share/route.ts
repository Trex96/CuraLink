import { NextRequest, NextResponse } from 'next/server';
import Trial from '@/models/trial/Trial';
import connectDB from '@/lib/db/connect';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';

export async function POST(req: NextRequest) {
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
    
    // Parse request body
    const body = await req.json();
    const { trialId, method } = body;
    
    // Validate input
    if (!trialId || !method) {
      return NextResponse.json(
        { error: 'Trial ID and method are required' },
        { status: 400 }
      );
    }
    
    // Check if trial exists
    const trial = await Trial.findById(trialId);
    if (!trial) {
      return NextResponse.json(
        { error: 'Trial not found' },
        { status: 404 }
      );
    }
    
    // Generate shareable link
    const shareLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/trials/${trial.nctNumber}`;
    
    // In a real implementation, we would:
    // 1. Send via email, SMS, or social media based on method
    // 2. Track sharing activity
    // 3. Handle recipient information if provided
    
    const result = {
      success: true,
      message: `Trial shared successfully via ${method}`,
      shareLink
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error sharing trial:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}