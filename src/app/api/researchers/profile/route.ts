import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/connect';
import UserModel from '@/models/user/User';

interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface UserDocument {
  _id: string;
  firstName: string;
  lastName: string;
  institution: string;
  role: string;
}

interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  institution: string;
  bio: string;
  expertise: string[];
  orcidId: string;
  openForCollaboration: boolean;
}

export async function GET(request: Request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await UserModel.findById((session.user as SessionUser).id).select('-password');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching researcher profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    // Connect to database
    await dbConnect();

    // Get user session
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a researcher
    const user = await UserModel.findById((session.user as SessionUser).id) as UserDocument | null;
    if (!user || user.role !== 'researcher') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get update data from request body
    const data: UpdateProfileRequest = await request.json();

    // Update user profile
    const updatedUser = await UserModel.findByIdAndUpdate(
      (session.user as SessionUser).id,
      {
        firstName: data.firstName,
        lastName: data.lastName,
        institution: data.institution,
        bio: data.bio,
        expertise: data.expertise,
        orcidId: data.orcidId,
        openForCollaboration: data.openForCollaboration,
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating researcher profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}