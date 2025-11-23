import * as mongoose from 'mongoose';
import type { Document, Model } from 'mongoose';

export interface IMessage extends Document {
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  content: string;
  status: 'sent' | 'delivered' | 'read';
  collaborationId: mongoose.Types.ObjectId;
  type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'system';
  replyTo?: mongoose.Types.ObjectId;
  reactions: {
    emoji: string;
    userId: mongoose.Types.ObjectId;
  }[];
  metadata?: {
    size?: number;
    duration?: number;
    mimeType?: string;
    fileName?: string;
  };
  deletedFor: mongoose.Types.ObjectId[];
  attachments?: {
    url: string;
    type: 'image' | 'video' | 'file';
    name: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new mongoose.Schema(
  {
    senderId: {
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
    content: {
      type: String,
      required: false, // Content is optional if there are attachments
      trim: true,
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'sent',
      index: true,
    },
    read: { // Deprecated, kept for backward compatibility but synced with status
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ['text', 'image', 'video', 'audio', 'file', 'system'],
      default: 'text',
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    reactions: [{
      emoji: { type: String, required: true },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
    }],
    metadata: {
      size: Number,
      duration: Number,
      mimeType: String,
      fileName: String,
    },
    deletedFor: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    collaborationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collaboration',
      required: true,
      index: true,
    },
    attachments: [{
      url: { type: String, required: true },
      type: { type: String, enum: ['image', 'video', 'file'], required: true },
      name: { type: String, required: true }
    }],
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
// Note: senderId, receiverId, and collaborationId already have indexes from index: true
MessageSchema.index({ senderId: 1, receiverId: 1 }); // Compound index for conversations
MessageSchema.index({ status: 1 });
MessageSchema.index({ createdAt: -1 });
MessageSchema.index({ 'reactions.userId': 1 });

const MessageModel: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);

export default MessageModel;