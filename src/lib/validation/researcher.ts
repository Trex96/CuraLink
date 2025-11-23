import { z } from 'zod';

export const researcherProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  institution: z.string().min(1, 'Institution is required'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  expertise: z.string().min(1, 'At least one expertise area is required'),
  orcidId: z.string().optional(),
  openForCollaboration: z.boolean(),
});

export const publicationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  authors: z.union([z.array(z.string()), z.string()]).refine(
    (val) => {
      if (typeof val === 'string') {
        return val.split(',').map(s => s.trim()).filter(s => s).length > 0;
      }
      return val.length > 0;
    },
    { message: 'At least one author is required' }
  ),
  journal: z.string().min(1, 'Journal is required'),
  publicationDate: z.date(),
  abstract: z.string().optional(),
  doi: z.string().optional(),
  pmid: z.string().optional(),
  citations: z.number().min(0).optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
});

export const pubmedImportSchema = z.object({
  searchMethod: z.enum(['name', 'orcid']),
  searchTerm: z.string().min(1, 'Search term is required'),
  maxResults: z.number().min(1).max(100).default(20),
});

export const researcherProfileUpdateSchema = researcherProfileSchema.partial({
  firstName: true,
  lastName: true,
  institution: true,
});

export const collaborationRequestSchema = z.object({
  receiverId: z.string().min(1, 'Receiver ID is required'),
  context: z.string().min(10, 'Context must be at least 10 characters').max(500, 'Context must be less than 500 characters'),
});

export const publicationImportSchema = z.object({
  orcidId: z.string().min(1, 'ORCID ID is required'),
});

export const imageUploadSchema = z.object({
  image: z.instanceof(File).refine(
    (file) => file.size <= 5 * 1024 * 1024,
    'File size must be less than 5MB'
  ).refine(
    (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type),
    'File must be a JPEG, PNG, or GIF image'
  ),
});

export type ResearcherProfile = z.infer<typeof researcherProfileSchema>;
export type CollaborationRequest = z.infer<typeof collaborationRequestSchema>;
export type PublicationImport = z.infer<typeof publicationImportSchema>;
export type ImageUpload = z.infer<typeof imageUploadSchema>;