import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import { archiveConversation, unarchiveConversation } from '@/lib/services/messages';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const userId = (session.user as { id: string }).id;

        // Check if body has action (archive/unarchive)
        // Default to archive if no body or simple PATCH
        let action = 'archive';
        try {
            const body = await request.json();
            if (body.action === 'unarchive') {
                action = 'unarchive';
            }
        } catch (e) {
            // No body, default to archive
        }

        if (action === 'unarchive') {
            await unarchiveConversation(id, userId);
        } else {
            await archiveConversation(id, userId);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error archiving/unarchiving conversation:', error);
        return NextResponse.json(
            { error: 'Failed to update conversation archive status' },
            { status: 500 }
        );
    }
}
