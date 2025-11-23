import { NextResponse } from 'next/server';
import imagekit from '@/lib/imagekit';

export async function GET() {
    try {
        const authenticationParameters = imagekit.getAuthenticationParameters();
        return NextResponse.json(authenticationParameters);
    } catch (error) {
        console.error('ImageKit auth error:', error);
        return NextResponse.json({ error: 'Auth failed' }, { status: 500 });
    }
}
