import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['patient', 'researcher']),
  location: z.object({
    type: z.literal('Point'),
    coordinates: z.tuple([z.number(), z.number()]),
  }).optional(),
});

export const trialSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  researcher: z.string(),
  diseaseCategory: z.string().min(1, 'Disease category is required'),
  location: z.object({
    type: z.literal('Point'),
    coordinates: z.tuple([z.number(), z.number()]),
  }).optional(),
  startDate: z.date(),
  endDate: z.date(),
  maxParticipants: z.number().min(1, 'Must have at least 1 participant'),
  eligibilityCriteria: z.array(z.string()).min(1, 'At least one eligibility criterion is required'),
  status: z.enum(['recruiting', 'active', 'completed', 'suspended']).optional(),
});

export const publicationSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  abstract: z.string().min(20, 'Abstract must be at least 20 characters'),
  authors: z.array(z.string()).min(1, 'At least one author is required'),
  researcher: z.string(),
  diseaseCategory: z.string().min(1, 'Disease category is required'),
  publicationDate: z.date(),
  journal: z.string().min(1, 'Journal name is required'),
  doi: z.string().optional(),
  keywords: z.array(z.string()).min(1, 'At least one keyword is required'),
});

export const forumPostSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  author: z.string(),
  category: z.string(),
  tags: z.array(z.string()).optional(),
});

export const forumCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty'),
  author: z.string(),
  post: z.string(),
  parentComment: z.string().optional(),
});

export const messageSchema = z.object({
  sender: z.string(),
  recipient: z.string(),
  content: z.string().min(1, 'Message cannot be empty'),
});
