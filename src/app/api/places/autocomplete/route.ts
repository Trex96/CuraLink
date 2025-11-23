import { NextRequest, NextResponse } from 'next/server';
import { getPlaceSuggestions } from '@/lib/utils/location';

// Simple rate limiting - in production, you might want to use Redis or similar
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 20; // Max requests per window
const RATE_LIMIT_WINDOW = 60000; // 1 minute window

function checkRateLimit(ip: string): { allowed: boolean; resetTime?: number } {
  const now = Date.now();
  const record = rateLimit.get(ip);
  
  if (!record || record.resetTime < now) {
    // Reset the rate limit
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true };
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return { allowed: false, resetTime: record.resetTime };
  }
  
  // Increment the count
  rateLimit.set(ip, { count: record.count + 1, resetTime: record.resetTime });
  return { allowed: true };
}

export async function GET(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitCheck = checkRateLimit(ip);
    
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    const { searchParams } = new URL(req.url);
    const input = searchParams.get('input');
    
    if (!input) {
      return NextResponse.json(
        { error: 'Input parameter is required' },
        { status: 400 }
      );
    }
    
    // Validate input length
    if (input.length > 100) {
      return NextResponse.json(
        { error: 'Input is too long' },
        { status: 400 }
      );
    }
    
    const suggestions = await getPlaceSuggestions(input);
    
    return NextResponse.json({ suggestions });
  } catch (error: unknown) {
    console.error('Places autocomplete error:', error);
    
    // Handle specific error cases
    if ((error as Error).message.includes('API key is not configured')) {
      return NextResponse.json(
        { error: 'Places service is not properly configured' },
        { status: 500 }
      );
    }
    
    if ((error as Error).message.includes('Rate limit')) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to get place suggestions' },
      { status: 500 }
    );
  }
}