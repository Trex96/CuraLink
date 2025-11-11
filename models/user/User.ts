import mongoose, { Schema, Document } from 'mongoose';

export enum UserRole {
  PATIENT = 'patient',
  RESEARCHER = 'researcher',
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  location?: {
    type: { type: string };
    coordinates: number[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
    },
    location: {
      type: {
        type: String,
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        index: '2dsphere',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Create geospatial index for location-based queries
UserSchema.index({ location: '2dsphere' });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
