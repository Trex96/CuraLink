import * as mongoose from 'mongoose';
import type { Document, Model } from 'mongoose';

export interface IProfileView extends Document {
    researcherId: mongoose.Types.ObjectId;
    viewerId?: mongoose.Types.ObjectId; // Optional, if logged in
    timestamp: Date;
}

const ProfileViewSchema = new mongoose.Schema(
    {
        researcherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        viewerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        timestamp: {
            type: Date,
            default: Date.now,
            index: true,
        },
    },
    {
        timestamps: false, // We only need timestamp
    }
);

// Index for aggregation by date
ProfileViewSchema.index({ researcherId: 1, timestamp: -1 });

const ProfileViewModel: Model<IProfileView> =
    mongoose.models.ProfileView || mongoose.model<IProfileView>('ProfileView', ProfileViewSchema);

export default ProfileViewModel;
