import mongoose, { Schema, Document } from 'mongoose';

export interface IForumCategory extends Document {
  name: string;
  description: string;
  diseaseCategory: string;
  createdAt: Date;
  updatedAt: Date;
}

const ForumCategorySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    diseaseCategory: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export interface IForumPost extends Document {
  title: string;
  content: string;
  author: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  tags: string[];
  likes: number;
  comments: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ForumPostSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'ForumCategory',
      required: true,
    },
    tags: [
      {
        type: String,
      },
    ],
    likes: {
      type: Number,
      default: 0,
    },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'ForumComment',
      },
    ],
  },
  {
    timestamps: true,
  }
);

export interface IForumComment extends Document {
  content: string;
  author: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  parentComment?: mongoose.Types.ObjectId;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

const ForumCommentSchema: Schema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'ForumPost',
      required: true,
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: 'ForumComment',
    },
    likes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const ForumCategory = mongoose.models.ForumCategory || mongoose.model<IForumCategory>('ForumCategory', ForumCategorySchema);
export const ForumPost = mongoose.models.ForumPost || mongoose.model<IForumPost>('ForumPost', ForumPostSchema);
export const ForumComment = mongoose.models.ForumComment || mongoose.model<IForumComment>('ForumComment', ForumCommentSchema);
