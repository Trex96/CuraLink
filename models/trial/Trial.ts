import mongoose, { Schema, Document } from 'mongoose';

export interface ITrial extends Document {
  title: string;
  description: string;
  researcher: mongoose.Types.ObjectId;
  diseaseCategory: string;
  location?: {
    type: { type: string };
    coordinates: number[];
  };
  startDate: Date;
  endDate: Date;
  enrollmentCount: number;
  maxParticipants: number;
  eligibilityCriteria: string[];
  status: 'recruiting' | 'active' | 'completed' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

const TrialSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    researcher: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    diseaseCategory: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String,
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        index: '2dsphere',
      },
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    enrollmentCount: {
      type: Number,
      default: 0,
    },
    maxParticipants: {
      type: Number,
      required: true,
    },
    eligibilityCriteria: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: ['recruiting', 'active', 'completed', 'suspended'],
      default: 'recruiting',
    },
  },
  {
    timestamps: true,
  }
);

// Create geospatial index for location-based queries
TrialSchema.index({ location: '2dsphere' });

export default mongoose.models.Trial || mongoose.model<ITrial>('Trial', TrialSchema);
