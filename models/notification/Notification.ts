import * as mongoose from 'mongoose';
import type { Document, Model } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'COLLABORATION_REQUEST' | 'COLLABORATION_ACCEPTED' | 'COLLABORATION_DECLINED' | 'NEW_MESSAGE' | 'FORUM_REPLY' | 'EXPERT_REQUEST' | 'NEW_PUBLICATION' | 'NEW_TRIAL';
  title: string;
  message: string;
  read: boolean;
  link?: string;
  referenceId?: string; // ID of the related entity
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    link: {
      type: String,
      trim: true,
    },
    referenceId: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ read: 1, createdAt: -1 });

const NotificationModel: Model<INotification> = 
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default NotificationModel;