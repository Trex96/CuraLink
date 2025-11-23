import * as mongoose from 'mongoose';
import type { Document, Model } from 'mongoose';

export interface ITrialApplication extends Document {
    trialId: mongoose.Types.ObjectId;
    patientId: mongoose.Types.ObjectId;
    status: 'pending' | 'approved' | 'rejected';
    message: string;
    patientInfo: {
        age?: number;
        gender?: string;
        medicalHistory?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const TrialApplicationSchema = new mongoose.Schema(
    {
        trialId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Trial',
            required: true,
        },
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        message: {
            type: String,
            required: true,
        },
        patientInfo: {
            age: Number,
            gender: String,
            medicalHistory: String,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
TrialApplicationSchema.index({ trialId: 1, patientId: 1 }, { unique: true });
TrialApplicationSchema.index({ status: 1 });
TrialApplicationSchema.index({ createdAt: -1 });

const TrialApplicationModel: Model<ITrialApplication> =
    mongoose.models.TrialApplication || mongoose.model<ITrialApplication>('TrialApplication', TrialApplicationSchema);

export default TrialApplicationModel;
