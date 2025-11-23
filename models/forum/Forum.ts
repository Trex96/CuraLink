import * as mongoose from 'mongoose';
import type { Document, Model } from 'mongoose';

// Forum Category interface
export interface IForumCategory extends Document {
  name: string;
  description: string;
  diseaseCategory: string;
  createdAt: Date;
  updatedAt: Date;
}

const ForumCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    diseaseCategory: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

ForumCategorySchema.index({ diseaseCategory: 1 });
ForumCategorySchema.index({ name: 'text', description: 'text' });

// Attachment interface
interface IAttachment {
  url: string;
  name: string;
  size: number;
}

// Forum Post interface
export interface IForumPost extends Document {
  authorId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  category: string; // Disease category
  tags: string[];
  upvotes: mongoose.Types.ObjectId[]; // User IDs who upvoted
  upvoteLog: { userId: mongoose.Types.ObjectId; createdAt: Date }[]; // Timestamped vote activity
  isResearcherVerified: boolean;
  attachments: IAttachment[];
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const ForumPostSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,

    },
    tags: [{
      type: String,
      trim: true,
    }],
    upvotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    upvoteLog: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      createdAt: { type: Date, default: Date.now }
    }],
    isResearcherVerified: {
      type: Boolean,
      default: false,

    },
    attachments: [{
      url: { type: String, required: true },
      name: { type: String, required: true },
      size: { type: Number, required: true }
    }],
    views: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ForumPostSchema.index({ authorId: 1 });
ForumPostSchema.index({ category: 1 });
ForumPostSchema.index({ createdAt: -1 });
ForumPostSchema.index({ title: 'text', content: 'text' });
ForumPostSchema.index({ tags: 1 });
// Index for faster vote activity lookups
ForumPostSchema.index({ 'upvoteLog.userId': 1, createdAt: -1 });

// Virtual for upvote count
ForumPostSchema.virtual('upvoteCount').get(function () {
  return (this.upvotes as mongoose.Types.ObjectId[])?.length || 0;
});

// Forum Comment interface
export interface IForumComment extends Document {
  postId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  content: string;
  upvotes: mongoose.Types.ObjectId[]; // User IDs who upvoted
  upvoteLog: { userId: mongoose.Types.ObjectId; createdAt: Date }[]; // Timestamped vote activity
  isVerifiedAnswer: boolean; // Whether this comment is a verified answer by a researcher
  createdAt: Date;
  updatedAt: Date;
}

const ForumCommentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ForumPost',
      required: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    upvotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    upvoteLog: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      createdAt: { type: Date, default: Date.now }
    }],
    // Threaded reply fields removed for comment-only system
    isVerifiedAnswer: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ForumCommentSchema.index({ postId: 1 });
ForumCommentSchema.index({ authorId: 1 });
// Removed parentId index due to flat comment model
ForumCommentSchema.index({ createdAt: -1 });
// Index for faster vote activity lookups
ForumCommentSchema.index({ 'upvoteLog.userId': 1, createdAt: -1 });

// Virtual for upvote count
ForumCommentSchema.virtual('upvoteCount').get(function () {
  return (this.upvotes as mongoose.Types.ObjectId[])?.length || 0;
});

const ForumCategoryModel: Model<IForumCategory> =
  mongoose.models.ForumCategory || mongoose.model<IForumCategory>('ForumCategory', ForumCategorySchema);

const ForumPostModel: Model<IForumPost> =
  mongoose.models.ForumPost || mongoose.model<IForumPost>('ForumPost', ForumPostSchema);

const ForumCommentModel: Model<IForumComment> =
  mongoose.models.ForumComment || mongoose.model<IForumComment>('ForumComment', ForumCommentSchema);

export { ForumCategoryModel, ForumPostModel, ForumCommentModel };