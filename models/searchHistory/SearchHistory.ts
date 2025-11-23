import * as mongoose from 'mongoose';
import type { Document, Model } from 'mongoose';

export interface ISearchHistory extends Document {
  userId: mongoose.Types.ObjectId;
  query: string;
  results: mongoose.Types.ObjectId[];
  clicked: mongoose.Types.ObjectId[];
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SearchHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    query: {
      type: String,
      required: true,
      trim: true,
    },
    results: [{
      type: mongoose.Schema.Types.ObjectId,
    }],
    clicked: [{
      type: mongoose.Schema.Types.ObjectId,
    }],
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
SearchHistorySchema.index({ userId: 1, timestamp: -1 });
SearchHistorySchema.index({ query: 'text' });
SearchHistorySchema.index({ timestamp: -1 });

const SearchHistoryModel: Model<ISearchHistory> = 
  mongoose.models.SearchHistory || mongoose.model<ISearchHistory>('SearchHistory', SearchHistorySchema);

export default SearchHistoryModel;