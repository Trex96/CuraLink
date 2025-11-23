import { NextRequest, NextResponse } from 'next/server';
import { searchPatients } from '@/lib/services/search';
import connectDB from '@/lib/db/connect';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import CollaborationModel from '@/models/collaboration/Collaboration';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const currentUserId = (session?.user as any)?.id;

    const filters = await req.json();

    const results = await searchPatients(filters);

    // If user is logged in, fetch connection status
    if (currentUserId && results.items.length > 0) {
      const patientIds = results.items.map(r => r._id);

      const collaborations = await CollaborationModel.find({
        $or: [
          { requesterId: currentUserId, receiverId: { $in: patientIds } },
          { requesterId: { $in: patientIds }, receiverId: currentUserId },
        ]
      }).lean();

      // Map status to results
      const itemsWithStatus = results.items.map((item: any) => {
        const collaboration = collaborations.find((c: any) =>
          (c.requesterId.toString() === currentUserId && c.receiverId.toString() === item._id.toString()) ||
          (c.receiverId.toString() === currentUserId && c.requesterId.toString() === item._id.toString())
        );

        let connectionStatus = 'none';
        let connectionId = null;

        if (collaboration) {
          connectionId = collaboration._id;
          if (collaboration.status === 'accepted') {
            connectionStatus = 'connected';
          } else if (collaboration.status === 'pending') {
            if (collaboration.requesterId.toString() === currentUserId) {
              connectionStatus = 'pending_sent';
            } else {
              connectionStatus = 'pending_received';
            }
          } else if (collaboration.status === 'declined') {
            connectionStatus = 'declined';
          }
        }

        return {
          ...item,
          connectionStatus,
          connectionId
        };
      });

      return NextResponse.json({ ...results, items: itemsWithStatus });
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search patients error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
