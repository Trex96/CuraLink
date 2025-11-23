import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/connect';
import UserModel, { IUser } from '@/models/user/User';
import TrialModel from '@/models/trial/Trial';
import { searchTrialsByPI, searchTrialsByInstitution, fetchTrialDetails } from '@/lib/services/clinicaltrials';
import { Types } from 'mongoose';

interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface TrialDocument {
  _id: Types.ObjectId;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
  toObject: () => Record<string, unknown>;
}

interface ImportRequest {
  searchMethod?: string;
  searchTerm?: string;
  maxResults?: number;
  trials?: Record<string, unknown>[];
  nctNumber?: string;
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

    // Get request data
    const requestData: ImportRequest = await request.json();
    const { searchMethod, searchTerm, maxResults, trials, nctNumber } = requestData;

    // Handle linking an existing trial
    if (nctNumber) {
      // Fetch the trial details from ClinicalTrials.gov
      const trialData = await fetchTrialDetails(nctNumber);
      
      // Check if trial already exists in our database
      let trial = await TrialModel.findOne({ nctNumber });
      
      // If trial doesn't exist, create it
      if (!trial) {
        trial = await TrialModel.create({
          ...trialData,
          nctNumber,
        });
      }
      
      // Transform trial data for response
      const transformedTrial = {
        ...trial.toObject(),
        _id: (trial as TrialDocument)._id.toString(),
        lastUpdated: (trial as TrialDocument).lastUpdated.toISOString(),
        createdAt: (trial as TrialDocument).createdAt.toISOString(),
        updatedAt: (trial as TrialDocument).updatedAt.toISOString(),
      };
      
      return NextResponse.json({ trial: transformedTrial });
    }

    // Handle importing new trials
    if (trials && Array.isArray(trials)) {
      // Save trials to database
      const savedTrials = [];
      
      for (const trial of trials) {
        // Check if trial already exists
        let existingTrial = await TrialModel.findOne({ nctNumber: trial.nctNumber });
        
        if (existingTrial) {
          // Update existing trial
          existingTrial = await TrialModel.findOneAndUpdate(
            { nctNumber: trial.nctNumber },
            trial,
            { new: true }
          );
          if (existingTrial) {
            savedTrials.push(existingTrial);
          }
        } else {
          // Create new trial
          const newTrial = await TrialModel.create(trial);
          savedTrials.push(newTrial);
        }
      }
      
      // Transform trials for response
      const transformedTrials = savedTrials.map(trial => ({
        ...trial.toObject(),
        _id: (trial as TrialDocument)._id.toString(),
        lastUpdated: (trial as TrialDocument).lastUpdated.toISOString(),
        createdAt: (trial as TrialDocument).createdAt.toISOString(),
        updatedAt: (trial as TrialDocument).updatedAt.toISOString(),
      }));
      
      return NextResponse.json({ trials: transformedTrials });
    }

    // Handle searching for trials
    if (searchMethod && searchTerm) {
      let trials = [];
      if (searchMethod === 'pi') {
        trials = await searchTrialsByPI(searchTerm, maxResults);
      } else if (searchMethod === 'institution') {
        trials = await searchTrialsByInstitution(searchTerm, maxResults);
      } else {
        return NextResponse.json({ error: 'Invalid search method' }, { status: 400 });
      }

      return NextResponse.json({ trials });
    }

    return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 });
  } catch (error) {
    console.error('Error importing trials:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}