import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import PublicationModel from '@/models/publication/Publication';
import { getAbsoluteFilePath } from '@/lib/utils/file-upload';
import fs from 'fs';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Get user session
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Find publication
        const publication = await PublicationModel.findById(id);

        if (!publication) {
            return NextResponse.json(
                { error: 'Publication not found' },
                { status: 404 }
            );
        }

        // Check if user owns this publication
        if (publication.researcherId.toString() !== (session.user as any).id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Check if publication has a PDF
        if (!publication.pdfFile) {
            return NextResponse.json(
                { error: 'No PDF file attached to this publication' },
                { status: 404 }
            );
        }

        // Get file path
        const filePath = getAbsoluteFilePath(publication.pdfFile);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return NextResponse.json(
                { error: 'File not found on server' },
                { status: 404 }
            );
        }

        // Read file
        const fileBuffer = fs.readFileSync(filePath);
        const filename = publication.pdfOriginalName || 'publication.pdf';

        // Return file with proper headers
        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Content-Length': fileBuffer.length.toString(),
            },
        });
    } catch (error) {
        console.error('Error downloading file:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
