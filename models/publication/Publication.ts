import * as mongoose from 'mongoose';
import type { Document, Model } from 'mongoose';

export interface IPublication extends Document {
  pmid?: string;
  title: string;
  abstract?: string;
  authors: string[];
  journal: string;
  publicationDate: Date;
  doi?: string;
  researcherId: mongoose.Types.ObjectId;
  citations: number;
  description?: string;
  pdfFile?: string;
  pdfOriginalName?: string;
  fileSize?: number;
  createdAt: Date;
  updatedAt: Date;
}

const PublicationSchema = new mongoose.Schema(
  {
    pmid: {
      type: String,
      sparse: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    abstract: {
      type: String,
      required: false,
      default: '',
    },
    authors: [{
      type: String,
      required: true,
    }],
    journal: {
      type: String,
      required: true,
      trim: true,
    },
    publicationDate: {
      type: Date,
      required: true,
    },
    doi: {
      type: String,
      sparse: true,
      trim: true,
    },
    researcherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    citations: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      trim: true,
    },
    pdfFile: {
      type: String,
      trim: true,
    },
    pdfOriginalName: {
      type: String,
      trim: true,
    },
    fileSize: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
PublicationSchema.index({ researcherId: 1 });
PublicationSchema.index({ publicationDate: -1 });
PublicationSchema.index({ journal: 1 });
PublicationSchema.index({ title: 'text', abstract: 'text', authors: 'text' });

// Compound indexes to ensure a researcher doesn't add the same publication twice
PublicationSchema.index({ researcherId: 1, pmid: 1 }, { unique: true, sparse: true });
PublicationSchema.index({ researcherId: 1, doi: 1 }, { unique: true, sparse: true });

const PublicationModel: Model<IPublication> =
  mongoose.models.Publication || mongoose.model<IPublication>('Publication', PublicationSchema);

export default PublicationModel;