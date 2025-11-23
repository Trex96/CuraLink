import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import UserModel from '@/models/user/User';
import PublicationModel from '@/models/publication/Publication';
import TrialModel from '@/models/trial/Trial';

interface SearchParams {
    query: string;
    limit?: number;
    offset?: number;
}

export async function POST(request: Request) {
    try {
        await dbConnect();

        const { query, limit = 20, offset = 0 } = await request.json() as SearchParams;

        if (!query || query.trim() === '') {
            return NextResponse.json({
                researchers: [],
                publications: [],
                trials: [],
                total: 0
            });
        }

        const searchRegex = new RegExp(query, 'i');

        // Search researchers
        const researchers = await UserModel.find({
            role: 'researcher',
            $or: [
                { firstName: searchRegex },
                { lastName: searchRegex },
                { institution: searchRegex },
                { expertise: searchRegex },
                { bio: searchRegex }
            ]
        })
            .select('firstName lastName institution expertise profilePicture')
            .limit(Math.min(limit, 10))
            .skip(offset)
            .lean();

        // Search patients
        const patients = await UserModel.find({
            role: 'patient',
            $or: [
                { firstName: searchRegex },
                { lastName: searchRegex },
                { bio: searchRegex },
                { conditions: searchRegex }
            ]
        })
            .select('firstName lastName bio conditions profilePicture')
            .limit(Math.min(limit, 10))
            .skip(offset)
            .lean();

        // Search publications
        const publications = await PublicationModel.find({
            $or: [
                { title: searchRegex },
                { abstract: searchRegex },
                { authors: searchRegex },
                { journal: searchRegex }
            ]
        })
            .select('title authors journal publicationDate doi pmid')
            .limit(Math.min(limit, 10))
            .skip(offset)
            .sort({ publicationDate: -1 })
            .lean();

        // Search trials
        const trials = await TrialModel.find({
            $or: [
                { title: searchRegex },
                { condition: searchRegex },
                { description: searchRegex },
                { sponsor: searchRegex }
            ]
        })
            .select('nctNumber title condition phase status startDate')
            .limit(Math.min(limit, 10))
            .skip(offset)
            .sort({ startDate: -1 })
            .lean();

        const total = researchers.length + patients.length + publications.length + trials.length;

        const items = [
            ...researchers.map(r => ({ ...r, type: 'researcher' })),
            ...patients.map(p => ({ ...p, type: 'patient', role: 'patient' })),
            ...publications.map(p => ({ ...p, type: 'publication' })),
            ...trials.map(t => ({ ...t, type: 'trial' }))
        ];

        return NextResponse.json({
            items,
            total,
            query
        });

    } catch (error) {
        console.error('Error in unified search:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
