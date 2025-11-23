import * as mongoose from 'mongoose';
import type { Document, Model } from 'mongoose';

export interface IResearcherRole {
  researcherId: mongoose.Types.ObjectId;
  role: 'PI' | 'Co-Investigator' | 'Site Coordinator' | 'Study Coordinator' | 'Other';
  addedAt: Date;
}

export interface ITrial extends Document {
  nctNumber: string;
  title: string;
  summary: string;
  detailedDescription?: string;
  status: string;
  phase: string;
  studyType?: string;
  enrollment?: number;
  startDate?: string;
  endDate?: string;
  locations: Array<{
    coordinates: [number, number];
    address?: string;
  }>;
  eligibilityCriteria: string[];
  contactInfo: string;
  conditions: string[];
  interventions: string[];
  sponsors?: string[];
  linkedResearchers: mongoose.Types.ObjectId[];
  researcherRoles: IResearcherRole[];
  importedFrom?: 'clinicaltrials.gov' | 'manual';
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TrialSchema = new mongoose.Schema(
  {
    nctNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    summary: {
      type: String,
      required: true,
    },
    detailedDescription: {
      type: String,
    },
    status: {
      type: String,
      required: true,
      trim: true,
    },
    phase: {
      type: String,
      required: true,
      trim: true,
    },
    studyType: {
      type: String,
    },
    enrollment: {
      type: Number,
    },
    startDate: {
      type: String,
    },
    endDate: {
      type: String,
    },
    locations: [{
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
      address: {
        type: String,
      },
    }],
    eligibilityCriteria: [{
      type: String,
    }],
    contactInfo: {
      type: String,
      required: true,
    },
    conditions: [{
      type: String,
      required: true,
    }],
    interventions: [{
      type: String,
    }],
    sponsors: [{
      type: String,
    }],
    linkedResearchers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    researcherRoles: [{
      researcherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      role: {
        type: String,
        enum: ['PI', 'Co-Investigator', 'Site Coordinator', 'Study Coordinator', 'Other'],
        required: true,
      },
      addedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    importedFrom: {
      type: String,
      enum: ['clinicaltrials.gov', 'manual'],
      default: 'manual',
    },
    lastUpdated: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
TrialSchema.index({ status: 1 });
TrialSchema.index({ phase: 1 });
TrialSchema.index({ conditions: 1 });
TrialSchema.index({ conditions: 1 });
TrialSchema.index({ title: 'text', summary: 'text' });
// TrialSchema.index({ locations: '2dsphere' });

// Prevent Mongoose OverwriteModelError in development
if (process.env.NODE_ENV !== 'production' && mongoose.models.Trial) {
  delete mongoose.models.Trial;
}

const TrialModel: Model<ITrial> =
  mongoose.models.Trial || mongoose.model<ITrial>('Trial', TrialSchema);

export default TrialModel;