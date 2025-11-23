import { NextRequest, NextResponse } from 'next/server';
import { geocodeAddress } from '@/lib/utils/location';

// Simple rate limiting - in production, you might want to use Redis or similar
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 10; // Max requests per window
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

interface GeocodeRequest {
  address: string;
}

export async function POST(req: NextRequest) {
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
    
    const body: GeocodeRequest = await req.json();
    const { address } = body;
    
    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }
    
    // Validate address length
    if (address.length > 200) {
      return NextResponse.json(
        { error: 'Address is too long' },
        { status: 400 }
      );
    }
    
    const coordinates = await geocodeAddress(address);
    
    return NextResponse.json(coordinates);
  } catch (error: unknown) {
    console.error('Geocoding error:', error);
    
    // Handle specific error cases
    if ((error as Error).message.includes('API key is not configured')) {
      return NextResponse.json(
        { error: 'Geocoding service is not properly configured' },
        { status: 500 }
      );
    }
    
    if ((error as Error).message.includes('ZERO_RESULTS')) {
      return NextResponse.json(
        { error: 'No results found for the provided address' },
        { status: 404 }
      );
    }
    
    if ((error as Error).message.includes('Rate limit')) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to geocode address' },
      { status: 500 }
    );
  }
}