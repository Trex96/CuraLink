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

// This is a mock implementation - in a real application, you would:
// 1. Handle file upload (to cloud storage like AWS S3, Cloudinary, etc.)
// 2. Validate the file type and size
// 3. Generate a secure URL
// 4. Save the URL to the database

export async function POST(request: Request) {
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

    // In a real implementation, you would process the file upload here
    // For this example, we'll return a mock URL
    const formData = await request.formData();
    const image = formData.get('image');

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Mock implementation - generate a fake URL
    // In reality, you would upload to a service like Cloudinary, S3, etc.
    const imageUrl = `https://example.com/profile-pictures/${user._id as Types.ObjectId}-${Date.now()}.jpg`;

    // Update user with profile picture URL
    await UserModel.findByIdAndUpdate(
      (session.user as SessionUser).id,
      { profilePicture: imageUrl },
      { new: true }
    );

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}