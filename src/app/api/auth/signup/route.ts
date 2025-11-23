import { NextRequest, NextResponse } from 'next/server';

import connectDB from '@/lib/db/connect';
import User from '@/models/user/User';
import { UserRole } from '@/types';

interface SignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  dateOfBirth?: string;
  institution?: string;
  bio?: string;
}

interface PatientData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  dateOfBirth: Date;
  conditions: string[];
  savedResearchers: string[];
  savedPublications: string[];
  savedTrials: string[];
}

interface ResearcherData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  institution: string;
  bio: string;
  expertise: string[];
  openForCollaboration: boolean;
  verifiedAnswerCount: number;
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body: SignupRequest = await req.json();

    // Basic CSRF-style origin check (configurable via env)
    const origin = req.headers.get('origin') || '';
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || process.env.NEXTAUTH_URL || '').split(',').map(s => s.trim()).filter(Boolean);
    if (allowedOrigins.length > 0 && !allowedOrigins.includes(origin)) {
      return NextResponse.json(
        { message: 'Invalid request origin' },
        { status: 403 }
      );
    }

    // Input validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!body.firstName?.trim() || !body.lastName?.trim()) {
      return NextResponse.json({ message: 'First and last name are required' }, { status: 400 });
    }
    if (!body.email?.trim() || !emailRegex.test(body.email)) {
      return NextResponse.json({ message: 'Valid email is required' }, { status: 400 });
    }
    if (!body.password || body.password.length < 6) {
      return NextResponse.json({ message: 'Password must be at least 6 characters' }, { status: 400 });
    }
    if (![UserRole.PATIENT, UserRole.RESEARCHER].includes(body.role)) {
      return NextResponse.json({ message: 'Invalid role' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: body.email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      );
    }

    // Create user based on role
    let userData: PatientData | ResearcherData;

    // Add role-specific fields
    if (body.role === UserRole.PATIENT) {
      const dob = body.dateOfBirth ? new Date(body.dateOfBirth) : null;
      if (!dob || isNaN(dob.getTime())) {
        return NextResponse.json({ message: 'Valid date of birth is required for patients' }, { status: 400 });
      }
      userData = {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        // Let the model hash on save to avoid double-hashing
        password: body.password,
        role: body.role,
        dateOfBirth: dob,
        conditions: [],
        savedResearchers: [],
        savedPublications: [],
        savedTrials: [],
      };
    } else if (body.role === UserRole.RESEARCHER) {
      if (!body.institution?.trim()) {
        return NextResponse.json({ message: 'Institution is required for researchers' }, { status: 400 });
      }
      if (!body.bio?.trim()) {
        return NextResponse.json({ message: 'Bio is required for researchers' }, { status: 400 });
      }
      userData = {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        // Let the model hash on save to avoid double-hashing
        password: body.password,
        role: body.role,
        institution: body.institution!,
        bio: body.bio!,
        expertise: [],
        openForCollaboration: false,
        verifiedAnswerCount: 0,
      };
    } else {
      return NextResponse.json(
        { message: 'Invalid role' },
        { status: 400 }
      );
    }

    // Create user
    const user = new User(userData);
    await user.save();

    return NextResponse.json(
      { message: 'User created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}