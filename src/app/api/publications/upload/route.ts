import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/connect';
import UserModel, { IUser } from '@/models/user/User';
import {
    validateFileType,
    validateFileSize,
    saveUploadedFile,
    getRelativeFilePath,
    deleteFile,
    getAbsoluteFilePath,
} from '@/lib/utils/file-upload';

interface SessionUser {
    id: string;
    email: string;
    role: string;
}

export async function POST(request: NextRequest) {
    let savedFilePath: string | null = null;

    try {
        // Connect to database
        await dbConnect();

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

        // Get uploaded file
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Validate file type
        if (!validateFileType(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Only PDF files are allowed.' },
                { status: 400 }
            );
        }

        // Validate file size
        if (!validateFileSize(file.size)) {
            return NextResponse.json(
                { error: 'File size exceeds 10MB limit.' },
                { status: 400 }
            );
        }

        // Save file
        const userId = user._id.toString();
        const { filePath, filename } = await saveUploadedFile(file, userId);
        savedFilePath = filePath; // Track for cleanup on error

        const relativePath = getRelativeFilePath(userId, filename);

        return NextResponse.json({
            success: true,
            file: {
                path: relativePath,
                originalName: file.name,
                size: file.size,
                mimeType: file.type,
            },
        });
    } catch (error) {
        console.error('Error uploading file:', error);

        // Clean up uploaded file if it exists
        if (savedFilePath) {
            try {
                await deleteFile(savedFilePath);
                console.log('Cleaned up uploaded file after error');
            } catch (cleanupError) {
                console.error('Error cleaning up file:', cleanupError);
            }
        }

        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
