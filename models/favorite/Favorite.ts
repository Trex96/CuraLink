import * as mongoose from 'mongoose';
import type { Document, Model } from 'mongoose';

export interface IFavorite extends Document {
  userId: mongoose.Types.ObjectId;
  itemType: 'researcher' | 'publication' | 'trial' | 'post';
  itemId: mongoose.Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const FavoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    itemType: {
      type: String,
      enum: ['researcher', 'publication', 'trial', 'post'],
      required: true,
    },
    itemId: {
      type: mongoose.Schema.Types.Mixed, // Support both ObjectId and String (for NCT numbers)
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
FavoriteSchema.index({ userId: 1, itemType: 1, itemId: 1 }, { unique: true });
FavoriteSchema.index({ itemType: 1, itemId: 1 });
FavoriteSchema.index({ createdAt: -1 });

// Delete the cached model to force recreation with the new schema
if (mongoose.models.Favorite) {
  delete mongoose.models.Favorite;
}

const FavoriteModel: Model<IFavorite> = mongoose.model<IFavorite>('Favorite', FavoriteSchema);

export default FavoriteModel;