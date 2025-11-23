import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/connect';
import NotificationModel from '@/models/notification/Notification';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || (session.user as { id?: string }).id;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Fetch notifications for the user, sorted by createdAt descending
    const notifications = await NotificationModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50) // Limit to 50 most recent notifications
      .lean();

    // Count unread notifications
    const unreadCount = await NotificationModel.countDocuments({ 
      userId, 
      read: false 
    });

    return NextResponse.json({ 
      notifications: JSON.parse(JSON.stringify(notifications)),
      unreadCount 
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { userId, type, title, message, referenceId } = body;

    // Validate required fields
    if (!userId || !type || !title || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create new notification
    const notification = await NotificationModel.create({
      userId,
      type,
      title,
      message,
      referenceId,
      read: false,
    });

    return NextResponse.json(JSON.parse(JSON.stringify(notification)), { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}