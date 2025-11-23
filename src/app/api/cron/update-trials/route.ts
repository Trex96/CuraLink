import { NextRequest, NextResponse } from 'next/server';
import { updateStaleTrials } from '@/lib/jobs/updateTrials';

// This is a Vercel cron endpoint that runs daily to update stale trials
export async function GET(req: NextRequest) {
  try {
    // Verify this is a cron request (in a real implementation, you would check for a secret)
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_AUTH_TOKEN}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('Starting trial update cron job');
    
    // Update stale trials
    await updateStaleTrials();
    
    console.log('Trial update cron job completed successfully');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Trial update cron job failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}