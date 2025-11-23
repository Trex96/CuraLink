import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/connect';
import UserModel, { IUser } from '@/models/user/User';
import { searchPubMedByAuthor, searchPubMedByOrcid } from '@/lib/services/pubmed';
import { Publication } from '@/types';

interface ImportRequest {
  searchMethod: 'name' | 'orcid';
  searchTerm: string;
  maxResults?: number;
}

interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface ImportResponse {
  publications: Publication[];
}

export async function POST(request: Request): Promise<NextResponse<ImportResponse | { error: string }>> {
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

    // Get search parameters
    const { searchMethod, searchTerm, maxResults }: ImportRequest = await request.json();

    if (!searchMethod || !searchTerm) {
      return NextResponse.json({ error: 'Search method and term are required' }, { status: 400 });
    }

    // Search PubMed
    let publications: Publication[] = [];
    if (searchMethod === 'name') {
      publications = await searchPubMedByAuthor(searchTerm, maxResults);
    } else if (searchMethod === 'orcid') {
      publications = await searchPubMedByOrcid(searchTerm, maxResults);
    } else {
      return NextResponse.json({ error: 'Invalid search method' }, { status: 400 });
    }

    return NextResponse.json({ publications });
  } catch (error) {
    console.error('Error importing from PubMed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}