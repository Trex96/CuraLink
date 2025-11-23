import { z } from 'zod';

// Search form schema
export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  category: z.enum(['all', 'researchers', 'publications', 'trials']).default('all'),
  sortBy: z.enum(['relevance', 'date', 'distance']).default('relevance'),
});

// Advanced search filters schema
export const searchFiltersSchema = z.object({
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string().optional(),
  }).optional(),
  radius: z.number().min(1).max(500).optional(), // in miles
  dateRange: z.object({
    from: z.date().optional(),
    to: z.date().optional(),
  }).optional(),
  conditions: z.array(z.string()).optional(),
  specialties: z.array(z.string()).optional(),
  trialStatus: z.array(z.enum([
    'recruiting', 
    'active', 
    'completed', 
    'suspended', 
    'terminated', 
    'withdrawn'
  ])).optional(),
  publicationDateRange: z.object({
    from: z.date().optional(),
    to: z.date().optional(),
  }).optional(),
});

export type SearchForm = z.infer<typeof searchSchema>;
export type SearchFilters = z.infer<typeof searchFiltersSchema>;