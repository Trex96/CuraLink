import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { ForumPostModel, ForumCommentModel } from '@/models/forum/Forum';
import User from '@/models/user/User';
import { Types } from 'mongoose';

interface TopUser {
  _id: Types.ObjectId;
  postCount?: number;
  commentCount?: number;
}

interface UserDetail {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
}

interface LeaderboardUser {
  userId: Types.ObjectId;
  name: string;
  count: number;
  type: 'poster' | 'commenter';
}

interface MergedUser {
  userId: Types.ObjectId;
  name: string;
  count: number;
  types: ('poster' | 'commenter')[];
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Get top users by post count
    const topPosters: TopUser[] = await ForumPostModel.aggregate([
      {
        $group: {
          _id: '$authorId',
          postCount: { $sum: 1 }
        }
      },
      {
        $sort: { postCount: -1 }
      },
      {
        $limit: limit
      }
    ]);
    
    // Get top users by comment count
    const topCommenters: TopUser[] = await ForumCommentModel.aggregate([
      {
        $group: {
          _id: '$authorId',
          commentCount: { $sum: 1 }
        }
      },
      {
        $sort: { commentCount: -1 }
      },
      {
        $limit: limit
      }
    ]);
    
    // Get user details for top posters
    const posterUserIds = topPosters.map(poster => poster._id);
    const posterUsers: UserDetail[] = await User.find({
      _id: { $in: posterUserIds }
    }).select('firstName lastName');
    
    // Combine data for top posters
    const topPostersWithDetails: LeaderboardUser[] = topPosters.map(poster => {
      const user = posterUsers.find(u => u._id.toString() === poster._id.toString());
      return {
        userId: poster._id,
        name: user ? `${user.firstName} ${user.lastName}` : 'Unknown User',
        count: poster.postCount || 0,
        type: 'poster' as const
      };
    });
    
    // Get user details for top commenters
    const commenterUserIds = topCommenters.map(commenter => commenter._id);
    const commenterUsers: UserDetail[] = await User.find({
      _id: { $in: commenterUserIds }
    }).select('firstName lastName');
    
    // Combine data for top commenters
    const topCommentersWithDetails: LeaderboardUser[] = topCommenters.map(commenter => {
      const user = commenterUsers.find(u => u._id.toString() === commenter._id.toString());
      return {
        userId: commenter._id,
        name: user ? `${user.firstName} ${user.lastName}` : 'Unknown User',
        count: commenter.commentCount || 0,
        type: 'commenter' as const
      };
    });
    
    // Combine and sort all users
    const allUsers: LeaderboardUser[] = [...topPostersWithDetails, ...topCommentersWithDetails];
    const userMap: Record<string, MergedUser> = {};
    
    // Merge users by ID
    allUsers.forEach(user => {
      const userIdStr = user.userId.toString();
      if (userMap[userIdStr]) {
        userMap[userIdStr].count += user.count;
        userMap[userIdStr].types.push(user.type);
      } else {
        userMap[userIdStr] = {
          userId: user.userId,
          name: user.name,
          count: user.count,
          types: [user.type]
        };
      }
    });
    
    // Convert to array and sort by count
    const leaderboard = Object.values(userMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
    
    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}