import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import UserModel from '@/models/user/User';
import type { IResearcher } from '@/models/user/User';
import PublicationModel from '@/models/publication/Publication';
import TrialModel from '@/models/trial/Trial';
import { ForumCategoryModel, ForumPostModel } from '@/models/forum/Forum';
import { UserRole } from '@/types';

export async function POST() {
  try {
    // Guard: only allow seeding in non-production environments
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Seeding is disabled in production' }, { status: 403 });
    }

    await connectDB();

    // 1. Seed Researchers
    const researchersData = [
      {
        email: 'jane.smith@hopkins.edu',
        password: 'Password123!',
        firstName: 'Jane',
        lastName: 'Smith',
        role: UserRole.RESEARCHER,
        institution: 'Johns Hopkins University',
        bio: 'Leading expert in cancer immunotherapy with over 15 years of experience in clinical trials.',
        expertise: ['Oncology', 'Immunotherapy', 'Clinical Trials'],
        openForCollaboration: true,
        location: {
          type: 'Point',
          coordinates: [-76.6122, 39.2904],
          address: 'Baltimore, MD',
        },
        verifiedAnswerCount: 45,
      },
      {
        email: 'michael.chen@mayo.edu',
        password: 'Password123!',
        firstName: 'Michael',
        lastName: 'Chen',
        role: UserRole.RESEARCHER,
        institution: 'Mayo Clinic',
        bio: 'Specializing in precision medicine and genetic cardiology.',
        expertise: ['Cardiology', 'Genetics', 'Precision Medicine'],
        openForCollaboration: true,
        location: {
          type: 'Point',
          coordinates: [-92.4668, 44.0121],
          address: 'Rochester, MN',
        },
        verifiedAnswerCount: 32,
      },
      {
        email: 'sarah.williams@stanford.edu',
        password: 'Password123!',
        firstName: 'Sarah',
        lastName: 'Williams',
        role: UserRole.RESEARCHER,
        institution: 'Stanford Medicine',
        bio: 'Focused on neurological disorders and Alzheimer\'s prevention strategies.',
        expertise: ['Neurology', 'Alzheimer\'s', 'Preventive Medicine'],
        openForCollaboration: true,
        location: {
          type: 'Point',
          coordinates: [-122.1697, 37.4275],
          address: 'Stanford, CA',
        },
        verifiedAnswerCount: 28,
      },
      {
        email: 'david.brown@harvard.edu',
        password: 'Password123!',
        firstName: 'David',
        lastName: 'Brown',
        role: UserRole.RESEARCHER,
        institution: 'Harvard Medical School',
        bio: 'Researching novel treatments for type 2 diabetes and metabolic disorders.',
        expertise: ['Endocrinology', 'Diabetes', 'Metabolism'],
        openForCollaboration: false,
        location: {
          type: 'Point',
          coordinates: [-71.1056, 42.3385],
          address: 'Boston, MA',
        },
        verifiedAnswerCount: 15,
      },
    ];

    const createdResearchers = [];
    for (const rData of researchersData) {
      let researcher = await UserModel.findOne({ email: rData.email });
      if (!researcher) {
        researcher = await UserModel.create(rData);
      }
      createdResearchers.push(researcher);
    }

    // 2. Seed Forum Categories
    const categories = [
      { name: 'Oncology', description: 'Cancer-related discussions and research updates', diseaseCategory: 'Cancer' },
      { name: 'Neurology', description: 'Brain, nervous system, and mental health', diseaseCategory: 'Neurology' },
      { name: 'Endocrinology', description: 'Hormones, diabetes, and metabolic disorders', diseaseCategory: 'Endocrinology' },
      { name: 'Cardiology', description: 'Heart health and cardiovascular diseases', diseaseCategory: 'Cardiology' },
      { name: 'Immunology', description: 'Immune system disorders and treatments', diseaseCategory: 'Immunology' },
      { name: 'General Health', description: 'General wellness, nutrition, and lifestyle', diseaseCategory: 'General' },
    ];

    for (const cat of categories) {
      const existing = await ForumCategoryModel.findOne({ name: cat.name });
      if (!existing) {
        await ForumCategoryModel.create(cat);
      }
    }

    // 3. Seed Publications
    const publicationsData = [
      {
        title: 'Novel Immunotherapy Approaches in Cancer Treatment',
        abstract: 'This study explores innovative immunotherapy techniques that have shown promising results in Phase III clinical trials for treating various forms of cancer. We discuss the mechanisms of action and potential side effects.',
        authors: ['Jane Smith', 'Michael Chen', 'Robert Johnson'],
        journal: 'Nature Medicine',
        publicationDate: new Date('2023-10-15'),
        doi: '10.1038/nm.2023.45',
        researcherId: createdResearchers[0]._id, // Jane Smith
        citations: 124,
        pmid: '37845678',
      },
      {
        title: 'Machine Learning Applications in Medical Diagnosis',
        abstract: 'We present a comprehensive review of machine learning algorithms applied to medical diagnosis, showing significant improvements in accuracy and speed across multiple specialties.',
        authors: ['Sarah Williams', 'David Brown', 'Lisa Davis'],
        journal: 'The Lancet Digital Health',
        publicationDate: new Date('2023-09-22'),
        doi: '10.1016/lancet.2023.78',
        researcherId: createdResearchers[2]._id, // Sarah Williams
        citations: 89,
        pmid: '37734567',
      },
      {
        title: 'Genomic Markers for Predicting Heart Disease Risk',
        abstract: 'A longitudinal study identifying key genomic markers that correlate with increased risk of cardiovascular events in adults over 50.',
        authors: ['Michael Chen', 'Emily White'],
        journal: 'Journal of the American College of Cardiology',
        publicationDate: new Date('2024-01-10'),
        doi: '10.1016/j.jacc.2023.11.005',
        researcherId: createdResearchers[1]._id, // Michael Chen
        citations: 45,
        pmid: '38212345',
      },
      {
        title: 'Lifestyle Interventions for Diabetes Management',
        abstract: 'Evaluating the long-term efficacy of dietary changes and exercise programs in managing Type 2 Diabetes without medication.',
        authors: ['David Brown', 'Sarah Williams'],
        journal: 'Diabetes Care',
        publicationDate: new Date('2023-12-05'),
        doi: '10.2337/dc23-1234',
        researcherId: createdResearchers[3]._id, // David Brown
        citations: 67,
        pmid: '38056789',
      },
    ];

    let publicationCountCreated = 0;
    for (const pub of publicationsData) {
      const exists = await PublicationModel.findOne({ title: pub.title });
      if (!exists) {
        await PublicationModel.create(pub);
        publicationCountCreated++;
      }
    }

    // 4. Seed Clinical Trials
    // Seed clinical trials with proper location data
    // Drop indexes to avoid conflicts with legacy geospatial indexes
    try {
      await TrialModel.collection.dropIndexes();
    } catch (e) {
      console.log('No indexes to drop or drop failed', e);
    }

    const trialsData = [
      {
        nctNumber: 'NCT05678901',
        title: 'CAR-T Cell Therapy for Blood Cancers',
        summary: 'A Phase 3 clinical trial investigating the efficacy of CAR-T cell therapy in treating various blood cancers including leukemia and lymphoma.',
        detailedDescription: 'This study will enroll 300 participants to evaluate the safety and efficacy of a new CAR-T cell therapy. Participants will be monitored for 2 years post-treatment.',
        status: 'Recruiting',
        phase: 'Phase 3',
        conditions: ['Blood Cancers', 'Leukemia', 'Lymphoma'],
        locations: [
          { type: 'Point', coordinates: [-76.6122, 39.2904], address: 'Johns Hopkins Hospital, Baltimore, MD' },
          { type: 'Point', coordinates: [-71.0589, 42.3601], address: 'Massachusetts General Hospital, Boston, MA' },
        ],
        eligibilityCriteria: [
          'Age 18-75',
          'Confirmed diagnosis of blood cancer',
          'ECOG performance status 0-2',
          'Adequate organ function'
        ],
        contactInfo: 'trials@hopkins.edu',
        interventions: ['CAR-T Therapy', 'Chemotherapy'],
        linkedResearchers: [createdResearchers[0]._id],
        lastUpdated: new Date(),
        researcherRoles: [{ researcherId: createdResearchers[0]._id, role: 'PI', addedAt: new Date() }]
      },
      {
        nctNumber: 'NCT05678902',
        title: 'Novel Alzheimer\'s Prevention Study',
        summary: 'Investigating early intervention strategies for preventing Alzheimer\'s disease in at-risk populations using a combination of medication and cognitive training.',
        status: 'Active, not recruiting',
        phase: 'Phase 2',
        conditions: ['Alzheimer\'s Disease', 'Dementia'],
        locations: [
          { type: 'Point', coordinates: [-122.1697, 37.4275], address: 'Stanford Medical Center, Stanford, CA' },
        ],
        eligibilityCriteria: [
          'Age 65-85',
          'Family history of Alzheimer\'s',
          'Normal cognitive function at baseline'
        ],
        contactInfo: 'alzheimers-study@stanford.edu',
        interventions: ['Cognitive Training', 'Investigational Drug X'],
        linkedResearchers: [createdResearchers[2]._id],
        lastUpdated: new Date(),
        researcherRoles: [{ researcherId: createdResearchers[2]._id, role: 'PI', addedAt: new Date() }]
      },
      {
        nctNumber: 'NCT05678903',
        title: 'Precision Medicine in Hypertension',
        summary: 'Using genetic profiling to tailor antihypertensive medication for patients with resistant hypertension.',
        status: 'Recruiting',
        phase: 'Phase 4',
        conditions: ['Hypertension', 'Cardiovascular Disease'],
        locations: [
          { type: 'Point', coordinates: [-92.4668, 44.0121], address: 'Mayo Clinic, Rochester, MN' },
        ],
        eligibilityCriteria: [
          'Age 40-80',
          'Resistant Hypertension',
          'Willing to undergo genetic testing'
        ],
        contactInfo: 'hypertension@mayo.edu',
        interventions: ['Genetic Profiling', 'Tailored Medication'],
        linkedResearchers: [createdResearchers[1]._id],
        lastUpdated: new Date(),
        researcherRoles: [{ researcherId: createdResearchers[1]._id, role: 'Co-Investigator', addedAt: new Date() }]
      },
      {
        nctNumber: 'NCT05678904',
        title: 'Novel Treatment for Chronic Migraine',
        summary: 'Evaluating a new preventive medication for patients with chronic migraine experiencing 15 or more headache days per month.',
        detailedDescription: 'This double-blind, placebo-controlled study will assess the efficacy of a novel CGRP inhibitor in reducing migraine frequency and severity over a 12-week period.',
        status: 'Recruiting',
        phase: 'Phase 3',
        conditions: ['Chronic Migraine', 'Headache Disorders'],
        locations: [
          { type: 'Point', coordinates: [-118.2437, 34.0522], address: 'UCLA Medical Center, Los Angeles, CA' },
          { type: 'Point', coordinates: [-87.6298, 41.8781], address: 'Northwestern Medicine, Chicago, IL' },
        ],
        eligibilityCriteria: [
          'Age 18-65',
          'Chronic migraine diagnosis (15+ headache days/month)',
          'Failed 2+ preventive treatments',
          'Able to complete daily headache diary'
        ],
        contactInfo: 'migraine-study@ucla.edu',
        interventions: ['CGRP Inhibitor', 'Placebo'],
        linkedResearchers: [createdResearchers[2]._id],
        lastUpdated: new Date(),
        enrollment: 250,
        startDate: new Date('2024-01-15'),
        researcherRoles: [{ researcherId: createdResearchers[2]._id, role: 'PI', addedAt: new Date() }]
      },
      {
        nctNumber: 'NCT05678905',
        title: 'Immunotherapy for Rheumatoid Arthritis',
        summary: 'Testing a new biologic therapy targeting specific immune pathways in moderate to severe rheumatoid arthritis.',
        detailedDescription: 'A multicenter Phase 2 trial examining the safety and efficacy of a novel JAK inhibitor in patients with active rheumatoid arthritis who have inadequately responded to methotrexate.',
        status: 'Recruiting',
        phase: 'Phase 2',
        conditions: ['Rheumatoid Arthritis', 'Autoimmune Disease'],
        locations: [
          { type: 'Point', coordinates: [-76.6122, 39.2904], address: 'Johns Hopkins Hospital, Baltimore, MD' },
          { type: 'Point', coordinates: [-75.1652, 39.9526], address: 'University of Pennsylvania, Philadelphia, PA' },
        ],
        eligibilityCriteria: [
          'Age 18-75',
          'Active RA for at least 6 months',
          'Inadequate response to methotrexate',
          'Willing to discontinue current biologic therapy'
        ],
        contactInfo: 'ra-trials@hopkins.edu',
        interventions: ['JAK Inhibitor', 'Standard Care'],
        linkedResearchers: [createdResearchers[0]._id],
        lastUpdated: new Date(),
        enrollment: 180,
        startDate: new Date('2024-02-01'),
        researcherRoles: [{ researcherId: createdResearchers[0]._id, role: 'PI', addedAt: new Date() }]
      },
    ];

    let trialCountCreated = 0;
    for (const trial of trialsData) {
      const exists = await TrialModel.findOne({ nctNumber: trial.nctNumber });
      if (!exists) {
        await TrialModel.create(trial);
        trialCountCreated++;
      }
    }

    // 5. Seed Forum Posts
    const forumPostsData = [
      {
        title: 'Latest advances in cancer immunotherapy?',
        content: 'I\'m looking for the most recent developments in cancer immunotherapy. Can anyone share some insights or recent publications? specifically interested in CAR-T therapy updates.',
        authorId: createdResearchers[0]._id, // Jane Smith
        category: 'Oncology',
        tags: ['cancer', 'immunotherapy', 'research'],
        views: 245,
        createdAt: new Date('2023-11-10'),
      },
      {
        title: 'Side effects of new diabetes medication',
        content: 'Has anyone experienced any unusual side effects with the new diabetes medication recently approved by the FDA? I have some patients reporting fatigue.',
        authorId: createdResearchers[3]._id, // David Brown
        category: 'Endocrinology',
        tags: ['diabetes', 'medication', 'side effects'],
        views: 189,
        createdAt: new Date('2023-11-08'),
      },
      {
        title: 'Genetic screening for heart disease',
        content: 'How often do you recommend genetic screening for patients with a family history of heart disease but no symptoms? Looking for current guidelines.',
        authorId: createdResearchers[1]._id, // Michael Chen
        category: 'Cardiology',
        tags: ['genetics', 'heart disease', 'screening'],
        views: 156,
        createdAt: new Date('2023-11-15'),
      },
    ];

    let forumPostCountCreated = 0;
    for (const post of forumPostsData) {
      const exists = await ForumPostModel.findOne({ title: post.title });
      if (!exists) {
        await ForumPostModel.create(post);
        forumPostCountCreated++;
      }
    }

    return NextResponse.json({
      ok: true,
      message: 'Database seeded successfully',
      counts: {
        researchers: createdResearchers.length,
        publications: publicationCountCreated,
        trials: trialCountCreated,
        forumPosts: forumPostCountCreated,
      },
    });

  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed data', details: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const researchers = await UserModel.countDocuments({ role: UserRole.RESEARCHER });
    const publications = await PublicationModel.countDocuments({});
    const trials = await TrialModel.countDocuments({});
    const posts = await ForumPostModel.countDocuments({});

    return NextResponse.json({
      ok: true,
      counts: {
        researchers,
        publications,
        trials,
        forumPosts: posts,
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get seed status' }, { status: 500 });
  }
}