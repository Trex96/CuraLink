import { UserRole } from '@/models/user/User';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  location?: {
    type: string;
    coordinates: number[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Trial {
  id: string;
  title: string;
  description: string;
  researcher: User;
  diseaseCategory: string;
  location?: {
    type: string;
    coordinates: number[];
  };
  startDate: Date;
  endDate: Date;
  enrollmentCount: number;
  maxParticipants: number;
  eligibilityCriteria: string[];
  status: 'recruiting' | 'active' | 'completed' | 'suspended';
  matchingPercentage?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Publication {
  id: string;
  title: string;
  abstract: string;
  authors: User[];
  researcher: User;
  diseaseCategory: string;
  publicationDate: Date;
  journal: string;
  doi?: string;
  keywords: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  diseaseCategory: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: User;
  category: ForumCategory;
  tags: string[];
  likes: number;
  comments: ForumComment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ForumComment {
  id: string;
  content: string;
  author: User;
  post: ForumPost;
  parentComment?: ForumComment;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  sender: User;
  recipient: User;
  content: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Location {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}
