import * as mongoose from 'mongoose';
import type { Document, Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '@/types';

// Base user interface
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
    address?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword: (password: string) => Promise<boolean>;
}

// Patient-specific interface
export interface IPatient extends IUser {
  dateOfBirth: Date;
  conditions: string[];
  savedResearchers: mongoose.Types.ObjectId[];
  savedPublications: mongoose.Types.ObjectId[];
  savedTrials: mongoose.Types.ObjectId[];
}

// Researcher-specific interface
export interface IResearcher extends IUser {
  institution: string;
  bio: string;
  expertise: string[];
  openForCollaboration: boolean;
  orcidId?: string;
  profilePicture?: string;
  verifiedAnswerCount: number;
}

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
        validate: {
          validator: function (val: unknown) {
            // If location.type is set to 'Point', coordinates must be [lng, lat]
            const hasType = (this as unknown as { location?: { type?: string } }).location?.type === 'Point';
            if (!hasType) return true; // allow missing when no type
            return Array.isArray(val) && val.length === 2 && val.every((n) => typeof n === 'number');
          },
          message: 'Location coordinates must be an array [longitude, latitude] when type is Point',
        },
      },
      address: {
        type: String,
      },
    },
    // Patient-specific fields
    dateOfBirth: {
      type: Date,
    },
    conditions: [{
      type: String,
    }],
    savedResearchers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    savedPublications: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Publication',
    }],
    savedTrials: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trial',
    }],
    // Researcher-specific fields
    institution: {
      type: String,
    },
    bio: {
      type: String,
    },
    expertise: [{
      type: String,
    }],
    openForCollaboration: {
      type: Boolean,
      default: false,
    },
    orcidId: {
      type: String,
    },
    profilePicture: {
      type: String,
    },
    verifiedAnswerCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create geospatial index for GeoJSON location; documents without location are allowed
UserSchema.index({ location: '2dsphere' });

// Virtual for full name
UserSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Hash password before saving
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: unknown) {
    next(error as Error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

// Conditional validation based on role
UserSchema.pre('validate', function (next) {
  if (this.role === UserRole.PATIENT) {
    // Patient-specific validations
    if (!this.dateOfBirth) {
      this.invalidate('dateOfBirth', 'Date of birth is required for patients');
    }
  } else if (this.role === UserRole.RESEARCHER) {
    // Researcher-specific validations
    if (!this.institution) {
      this.invalidate('institution', 'Institution is required for researchers');
    }
  }
  next();
});

const UserModel: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default UserModel;