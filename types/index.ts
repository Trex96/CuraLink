// Centralized enum to avoid importing server-only Mongoose models in client code
export enum UserRole {
  PATIENT = 'patient',
  RESEARCHER = 'researcher',
}

// Base interface for all documents
export interface BaseDocument {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

// User interfaces
export interface User extends BaseDocument {
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
}

export interface Patient extends User {
  dateOfBirth: Date;
  conditions: string[];
  savedResearchers: string[]; // User IDs
  savedPublications: string[]; // Publication IDs
  savedTrials: string[]; // Trial IDs
}

export interface Researcher extends User {
  institution: string;
  bio: string;
  expertise: string[];
  openForCollaboration: boolean;
  orcidId?: string;
  profilePicture?: string;
  verifiedAnswerCount: number;
}

// Publication interface
export interface Publication extends BaseDocument {
  pmid?: string;
  title: string;
  abstract?: string;
  authors: string[];
  journal: string;
  publicationDate: Date;
  doi?: string;
  researcherId: string; // User ID of the researcher
  citations: number;
  description?: string;
  pdfFile?: string;
  pdfOriginalName?: string;
  fileSize?: number;
}

// PubMed XML parsing interfaces
export interface PubMedAuthor {
  lastName?: string;
  foreName?: string;
  initials?: string;
  affiliation?: string;
}

export interface PubMedPublication {
  pmid: string;
  title: string;
  abstract: string;
  authors: PubMedAuthor[];
  journal: string;
  publicationDate: Date;
  doi?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  issn?: string;
  meshTerms?: string[];
}

// Clinical Trial interface
export interface ClinicalTrial extends BaseDocument {
  nctNumber: string;
  title: string;
  summary: string;
  status: string;
  phase: string;
  locations: Array<{
    coordinates: [number, number];
    address?: string;
  }>;
  eligibilityCriteria: string[];
  contactInfo: string;
  conditions: string[];
  interventions: string[];
  lastUpdated: Date;
  importedFrom?: 'clinicaltrials.gov' | 'manual';
  detailedDescription?: string;
  sponsors?: string[];
  startDate?: string;
  endDate?: string;
  enrollment?: number;
  studyType?: string;
}

// Collaboration interface
export interface Collaboration extends BaseDocument {
  requesterId: string; // User ID
  receiverId: string; // User ID
  status: 'pending' | 'accepted' | 'declined';
  context: string; // Message
  acceptedAt?: Date;
}

// Message interface
export interface Message extends BaseDocument {
  senderId: string; // User ID
  receiverId: string; // User ID
  content: string;
  read: boolean;
  collaborationId: string; // Collaboration ID
}

// Forum interfaces
export interface ForumPost extends BaseDocument {
  authorId: string; // User ID
  title: string;
  content: string;
  category: string; // Disease
  tags: string[];
  upvotes: string[]; // User IDs who upvoted
  isResearcherVerified: boolean;
}

export interface ForumComment extends BaseDocument {
  postId: string; // ForumPost ID
  authorId: string; // User ID
  content: string;
  upvotes: string[]; // User IDs who upvoted
}

// Favorite interface
export interface Favorite extends BaseDocument {
  userId: string; // User ID
  itemType: 'researcher' | 'publication' | 'trial';
  itemId: string; // ID of the item being favorited
}

// Search History interface
export interface SearchHistory extends BaseDocument {
  userId: string; // User ID
  query: string;
  results: string[]; // IDs of results
  clicked: string[]; // IDs of clicked results
  timestamp: Date;
}

// Notification interface
export interface Notification extends BaseDocument {
  userId: string; // User ID
  type: 'COLLABORATION_REQUEST' | 'COLLABORATION_ACCEPTED' | 'COLLABORATION_DECLINED' | 'NEW_MESSAGE' | 'FORUM_REPLY' | 'EXPERT_REQUEST' | 'NEW_PUBLICATION' | 'NEW_TRIAL' | 'NEW_QUESTION_IN_FIELD';
  title: string;
  message: string;
  read: boolean;
  link?: string;
  referenceId?: string; // ID of the related entity
}

// Location interface
export interface Location {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

// Auth interfaces
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthSession {
  user: AuthUser;
  expires: string;
}

// Search interfaces
export interface SearchFilters {
  query: string;
  location?: {
    coordinates: [number, number];
    maxDistance?: number; // in kilometers
  };
  conditions?: string[];
  sortBy?: 'relevance' | 'distance' | 'date';
  page?: number;
  limit?: number;
  radius?: number; // in kilometers
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ResearcherSearchResult extends Researcher {
  matchPercentage: number;
  distance?: number; // in kilometers
}

export interface TrialSearchResult extends ClinicalTrial {
  matchPercentage: number;
  distance?: number; // in kilometers
}

export interface PublicationSearchResult extends Publication {
  matchPercentage: number;
}

export interface SearchSuggestion {
  text: string;
  type: 'researcher' | 'trial' | 'publication' | 'condition';

}