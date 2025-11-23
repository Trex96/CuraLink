import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/user/User';
import connectDB from '@/lib/db/connect';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import Collaboration from '@/models/collaboration/Collaboration';

interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
      const { id } = await params;
    
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
    const { message } = body;
    
    // Validate message
    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }
    
    if (message.length > 1000) {
      return NextResponse.json(
        { error: 'Message is too long (max 1000 characters)' },
        { status: 400 }
      );
    }
    
    // Fetch researcher
    const researcher = await User.findById(id);
    if (!researcher || researcher.role !== 'researcher') {
      return NextResponse.json(
        { error: 'Researcher not found' },
        { status: 404 }
      );
    }
    
    // Create collaboration request
    const collaboration = new Collaboration({
      requesterId: (session.user as SessionUser).id,
      receiverId: id,
      status: 'pending',
      context: message
    });
    
    await collaboration.save();
    
    // In a real implementation, we would send a notification to the researcher
    // For now, we'll just return success
    
    return NextResponse.json({ 
      success: true,
      message: 'Request sent successfully'
    });
  } catch (error) {
    console.error('Error sending researcher request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}