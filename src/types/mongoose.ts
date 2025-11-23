/**
 * Common type definitions for populated Mongoose documents
 * Use these types when working with populated documents to avoid 'any' casts
 */

import { Types } from 'mongoose';

/**
 * Populated User document with researcher-specific fields
 */
export interface PopulatedUserDocument {
    _id: Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    institution?: string;
    bio?: string;
    expertise?: string[];
    profilePicture?: string;
}

/**
 * Populated Collaboration with user details
 */
export interface PopulatedCollaboration {
    _id: Types.ObjectId;
    requesterId: PopulatedUserDocument;
    receiverId: PopulatedUserDocument;
    context: string;
    status: string;
    createdAt: Date;
    updatedAt?: Date;
    acceptedAt?: Date;
}

/**
 * MongoDB aggregation pipeline stage type
 */
export interface AggregationStage {
    [key: string]: unknown;
}

/**
 * Generic aggregation match stage
 */
export interface MatchStage {
    [key: string]: unknown;
}
