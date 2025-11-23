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

interface PublicationInput {
  pmid?: string;
  doi?: string;
  title: string;
  authors: string[] | string;
  journal: string;
  publicationDate: string | Date;
  abstract?: string;
  citations?: number;
  description?: string;
  pdfFile?: string;
  pdfOriginalName?: string;
  fileSize?: number;
  [key: string]: unknown;
}

interface PublicationRequest {
  publications?: PublicationInput[];
  publication?: PublicationInput;
}

interface PublicationData {
  [key: string]: unknown;
  researcherId: unknown;
  publicationDate: Date;
}

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
    const user: IUser | null = await UserModel.findById((session.user as SessionUser).id);
    if (!user || user.role !== 'researcher') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get publication data
    const body: PublicationRequest = await request.json();

    // Handle batch import
    if (body.publications && Array.isArray(body.publications)) {
      // Add researcherId to each publication and remove _id (let Mongoose generate it)
      const publicationsWithResearcher = body.publications.map((pub) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _id, ...rest } = pub;
        return {
          ...rest,
          // Ensure abstract is present (empty string if missing)
          abstract: rest.abstract ?? '',
          researcherId: user._id,
          // Ensure dates are properly formatted
          publicationDate: new Date(pub.publicationDate),
        };
      });

      // Filter out duplicates
      const pmids = publicationsWithResearcher.map(p => p.pmid).filter(Boolean) as string[];
      const dois = publicationsWithResearcher.map(p => p.doi).filter(Boolean) as string[];

      const existing = await PublicationModel.find({
        researcherId: user._id,
        $or: [
          { pmid: { $in: pmids } },
          { doi: { $in: dois } }
        ]
      });

      const existingPmids = new Set(existing.map(p => p.pmid).filter(Boolean));
      const existingDois = new Set(existing.map(p => p.doi).filter(Boolean));

      const toInsert = publicationsWithResearcher.filter(p => {
        if (p.pmid && existingPmids.has(p.pmid)) return false;
        if (p.doi && existingDois.has(p.doi)) return false;
        return true;
      });

      if (toInsert.length === 0) {
        return NextResponse.json({
          publications: [],
          message: 'All publications already exist in your library.'
        });
      }

      // Insert new publications
      const publications = await PublicationModel.insertMany(toInsert);
      return NextResponse.json({ publications });
    }

    // Handle single publication
    if (body.publication) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, ...rest } = body.publication;
      const publicationData = {
        ...rest,
        // Ensure abstract is present (empty string if missing)
        abstract: rest.abstract ?? '',
        researcherId: user._id,
        // Ensure dates are properly formatted
        publicationDate: new Date(body.publication.publicationDate),
      };

      // Check for duplicate
      const existing = await PublicationModel.findOne({
        researcherId: user._id,
        $or: [
          ...(publicationData.pmid ? [{ pmid: publicationData.pmid }] : []),
          ...(publicationData.doi ? [{ doi: publicationData.doi }] : [])
        ]
      });

      if (existing) {
        return NextResponse.json({ error: 'Publication already exists in your library' }, { status: 409 });
      }

      const publication = await PublicationModel.create(publicationData);

      return NextResponse.json({ publication });
    }

    return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
  } catch (error) {
    console.error('Error adding publication:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}