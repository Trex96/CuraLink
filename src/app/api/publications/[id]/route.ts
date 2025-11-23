import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/connect';
import PublicationModel from '@/models/publication/Publication';
import UserModel, { IUser } from '@/models/user/User';

interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Connect to database
    await dbConnect();
    const { id } = await params;

    // Get user session
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a researcher
    const user: IUser | null = await UserModel.findById((session.user as SessionUser).id);
    if (!user || user.role !== 'researcher') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get update data
    const updateData = await request.json();

    // Update publication if it belongs to this researcher
    const publication = await PublicationModel.findOneAndUpdate(
      { _id: id, researcherId: user._id },
      {
        ...updateData,
        // Ensure dates are properly formatted if provided
        ...(updateData.publicationDate && { publicationDate: new Date(updateData.publicationDate) })
      },
      { new: true }
    );

    if (!publication) {
      return NextResponse.json({ error: 'Publication not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json(publication);
  } catch (error) {
    console.error('Error updating publication:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Connect to database
    await dbConnect();
    const { id } = await params;

    // Get user session
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a researcher
    const user: IUser | null = await UserModel.findById((session.user as SessionUser).id);
    if (!user || user.role !== 'researcher') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete publication if it belongs to this researcher
    const publication = await PublicationModel.findOne({
      _id: id,
      researcherId: user._id
    });

    if (!publication) {
      return NextResponse.json({ error: 'Publication not found or unauthorized' }, { status: 404 });
    }

    // Delete associated PDF file if it exists
    if (publication.pdfFile) {
      const { deleteFile, getAbsoluteFilePath } = await import('@/lib/utils/file-upload');
      const filePath = getAbsoluteFilePath(publication.pdfFile);
      await deleteFile(filePath);
    }

    // Now delete the publication
    await publication.deleteOne();

    return NextResponse.json({ message: 'Publication deleted successfully' });
  } catch (error) {
    console.error('Error deleting publication:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}