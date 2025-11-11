import mongoose, { Schema, Document } from 'mongoose';

export interface IPublication extends Document {
  title: string;
  abstract: string;
  authors: mongoose.Types.ObjectId[];
  researcher: mongoose.Types.ObjectId;
  diseaseCategory: string;
  publicationDate: Date;
  journal: string;
  doi?: string;
  keywords: string[];
  createdAt: Date;
  updatedAt: Date;
}

const PublicationSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    abstract: {
      type: String,
      required: true,
    },
    authors: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    researcher: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    diseaseCategory: {
      type: String,
      required: true,
    },
    publicationDate: {
      type: Date,
      required: true,
    },
    journal: {
      type: String,
      required: true,
    },
    doi: {
      type: String,
    },
    keywords: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Publication || mongoose.model<IPublication>('Publication', PublicationSchema);
