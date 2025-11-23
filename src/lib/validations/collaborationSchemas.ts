import { z } from 'zod';

// Collaboration request schema
export const collaborationRequestSchema = z.object({
  receiverId: z.string().min(1, 'Receiver ID is required'),
  context: z.string().min(10, 'Context must be at least 10 characters').max(500, 'Context must be less than 500 characters'),
  researchArea: z.string().min(1, 'Research area is required'),
  expectedOutcome: z.string().max(300, 'Expected outcome must be less than 300 characters').optional(),
});

// Publication manual entry schema
export const publicationManualEntrySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  authors: z.string().min(1, 'At least one author is required'),
  journal: z.string().min(1, 'Journal is required'),
  publicationDate: z.date({
    message: 'Publication date is required',
  }),
  abstract: z.string().max(5000, 'Abstract must be less than 5000 characters').optional(),
  doi: z.string().optional(),
  keywords: z.array(z.string()).min(1, 'At least one keyword is required'),
});

export type CollaborationRequest = z.infer<typeof collaborationRequestSchema>;
export type PublicationManualEntry = z.infer<typeof publicationManualEntrySchema>;