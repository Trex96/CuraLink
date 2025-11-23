import { z } from 'zod';

// Base user schema
export const baseUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Patient registration schema
export const patientRegistrationSchema = baseUserSchema.extend({
  dateOfBirth: z.date({
    message: 'Date of birth is required',
  }),
  gender: z.enum(['male', 'female', 'other'], {
    message: 'Gender is required',
  }),
  conditions: z.array(z.string()).optional(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string().optional(),
  }).optional(),
});

// Researcher registration schema
export const researcherRegistrationSchema = baseUserSchema.extend({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  institution: z.string().min(1, 'Institution is required'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  expertise: z.array(z.string()).min(1, 'At least one expertise area is required'),
  orcidId: z.string().optional(),
  openForCollaboration: z.boolean().default(false),
});

// Profile update schema (partial)
export const profileUpdateSchema = baseUserSchema.partial().extend({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  dateOfBirth: z.date().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  conditions: z.array(z.string()).optional(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string().optional(),
  }).optional(),
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  institution: z.string().min(1, 'Institution is required').optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  expertise: z.array(z.string()).optional(),
  orcidId: z.string().optional(),
  openForCollaboration: z.boolean().optional(),
});

// Settings/preferences schema
export const settingsSchema = z.object({
  emailNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(false),
  newsletterSubscription: z.boolean().default(true),
  privacyLevel: z.enum(['public', 'private', 'friends'], {
    message: 'Privacy level is required',
  }).default('public'),
});

export type PatientRegistration = z.infer<typeof patientRegistrationSchema>;
export type ResearcherRegistration = z.infer<typeof researcherRegistrationSchema>;
export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;
export type Settings = z.infer<typeof settingsSchema>;