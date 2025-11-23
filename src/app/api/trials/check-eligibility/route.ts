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
    const { trialId, userAnswers } = body;
    
    // Validate input
    if (!trialId || !userAnswers) {
      return NextResponse.json(
        { error: 'Trial ID and user answers are required' },
        { status: 400 }
      );
    }
    
    // Fetch the trial
    const trial = await Trial.findById(trialId);
    if (!trial) {
      return NextResponse.json(
        { error: 'Trial not found' },
        { status: 404 }
      );
    }
    
    // Calculate match percentage based on user answers
    // In a real implementation, this would be more sophisticated
    const totalCriteria = trial.eligibilityCriteria?.length || 0;
    const matchedCriteria = Object.values(userAnswers).filter(Boolean).length;
    
    // Calculate match percentage
    let matchPercentage = 0;
    if (totalCriteria > 0) {
      // Weight answered criteria more heavily than unanswered ones
      matchPercentage = Math.round((matchedCriteria / totalCriteria) * 100);
    }
    
    // Determine eligibility (simplified logic)
    const isEligible = matchPercentage >= 70;
    
    // Separate matched and unmatched criteria
    const matchedCriteriaList = Object.keys(userAnswers).filter(key => userAnswers[key]);
    const unmatchedCriteriaList = Object.keys(userAnswers).filter(key => !userAnswers[key]);
    
    const result = {
      isEligible,
      matchPercentage,
      matchedCriteria: matchedCriteriaList,
      unmatchedCriteria: unmatchedCriteriaList,
      additionalInfo: 'This assessment is based on your answers. Please consult with the research team for a complete evaluation.'
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error checking eligibility:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}