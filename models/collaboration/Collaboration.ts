import * as mongoose from 'mongoose';
import type { Document, Model } from 'mongoose';

export interface ICollaboration extends Document {
  requesterId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'declined';
  context: string;
  acceptedAt?: Date;
  archivedBy: mongoose.Types.ObjectId[];
  pinnedBy: mongoose.Types.ObjectId[];
  mutedBy: mongoose.Types.ObjectId[];
  wallpaper?: {
    userId: mongoose.Types.ObjectId;
    url: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const CollaborationSchema = new mongoose.Schema(
  {
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
      required: true,
    },
    context: {
      type: String,
      required: true,
      trim: true,
    },
    acceptedAt: {
      type: Date,
    },
    archivedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    pinnedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    mutedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    wallpaper: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      url: { type: String }
    }],
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
CollaborationSchema.index({ requesterId: 1, receiverId: 1 });
CollaborationSchema.index({ status: 1 });
CollaborationSchema.index({ createdAt: -1 });

// Ensure requester and receiver are not the same
CollaborationSchema.pre<ICollaboration>('validate', function (next) {
  if (this.requesterId.equals(this.receiverId)) {
    next(new Error('Requester and receiver cannot be the same user'));
  } else {
    next();
  }
});

const CollaborationModel: Model<ICollaboration> =
  mongoose.models.Collaboration || mongoose.model<ICollaboration>('Collaboration', CollaborationSchema);

export default CollaborationModel;