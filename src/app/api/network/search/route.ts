import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/connect';
import UserModel from '@/models/user/User';
import CollaborationModel from '@/models/collaboration/Collaboration';
import { Types } from 'mongoose';

interface SessionUser {
    id: string;
    role: string;
}

export async function GET(request: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as SessionUser).id;
        const userObjectId = new Types.ObjectId(userId);
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';
        const role = searchParams.get('role'); // 'researcher', 'patient', or undefined (all)
        const limit = parseInt(searchParams.get('limit') || '20');

        // Build search criteria
        const searchCriteria: any = {
            _id: { $ne: userObjectId }, // Exclude current user
        };

        if (role && role !== 'all') {
            searchCriteria.role = role;
        }

        if (query) {
            const regex = new RegExp(query, 'i');
            searchCriteria.$or = [
                { firstName: regex },
                { lastName: regex },
                { institution: regex },
                { expertise: { $in: [regex] } },
                { conditions: { $in: [regex] } },
            ];
        }

        // Fetch users
        const users = await UserModel.find(searchCriteria)
            .select('firstName lastName role institution expertise conditions profilePicture bio')
            .limit(limit)
            .lean();

        // Fetch connection status
        // Find collaborations where current user is involved and the other party is in the fetched users list
        const userIds = users.map(u => u._id);
        const collaborations = await CollaborationModel.find({
            $or: [
                { requesterId: userId, receiverId: { $in: userIds } },
                { requesterId: { $in: userIds }, receiverId: userId },
            ],
        }).lean();

        // Map status to users
        const usersWithStatus = users.map((user: any) => {
            const collaboration = collaborations.find(
                (c: any) =>
                    (c.requesterId.toString() === userId && c.receiverId.toString() === user._id.toString()) ||
                    (c.receiverId.toString() === userId && c.requesterId.toString() === user._id.toString())
            );

            let connectionStatus = 'none'; // none, pending_sent, pending_received, connected
            let connectionId = null;

            if (collaboration) {
                connectionId = collaboration._id;
                if (collaboration.status === 'accepted') {
                    connectionStatus = 'connected';
                } else if (collaboration.status === 'pending') {
                    if (collaboration.requesterId.toString() === userId) {
                        connectionStatus = 'pending_sent';
                    } else {
                        connectionStatus = 'pending_received';
                    }
                } else if (collaboration.status === 'declined') {
                    // Treat declined as none so they can try again? Or keep as declined?
                    // Usually LinkedIn allows trying again after some time, but for simplicity let's show as none or declined
                    connectionStatus = 'declined';
                }
            }

            return {
                ...user,
                _id: user._id.toString(),
                connectionStatus,
                connectionId,
            };
        });

        return NextResponse.json(usersWithStatus);
    } catch (error) {
        console.error('Error searching users:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
