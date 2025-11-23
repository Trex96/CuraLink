import User from '@/models/user/User';
import Publication from '@/models/publication/Publication';
import Trial from '@/models/trial/Trial';
import { SearchFilters, ResearcherSearchResult, TrialSearchResult, PublicationSearchResult, SearchSuggestion } from '@/types';
import { Types } from 'mongoose';

interface Location {
  coordinates: [number, number];
  address?: string;
}

interface PublicationDocument {
  _id: Types.ObjectId;
  researcherId: Types.ObjectId;
}

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Calculate keyword relevance score (0-40)
function calculateKeywordRelevance(query: string, title: string, description: string): number {
  const queryTerms = query.toLowerCase().split(' ');
  const titleText = title.toLowerCase();
  const descriptionText = description.toLowerCase();

  let score = 0;

  // Check for exact matches
  if (titleText.includes(query.toLowerCase())) {
    score += 20;
  }

  if (descriptionText.includes(query.toLowerCase())) {
    score += 10;
  }

  // Check for individual term matches
  queryTerms.forEach(term => {
    if (titleText.includes(term)) {
      score += 5;
    }
    if (descriptionText.includes(term)) {
      score += 2;
    }
  });

  return Math.min(score, 40); // Max 40 points
}

// Calculate disease/condition match score (0-25)
function calculateConditionMatch(queryConditions: string[], itemConditions: string[]): number {
  if (!queryConditions || queryConditions.length === 0 || !itemConditions || itemConditions.length === 0) {
    return 0;
  }

  const matches = queryConditions.filter(condition =>
    itemConditions.some(itemCondition =>
      itemCondition.toLowerCase().includes(condition.toLowerCase()) ||
      condition.toLowerCase().includes(itemCondition.toLowerCase())
    )
  );

  // Calculate percentage of matching conditions
  const matchPercentage = (matches.length / queryConditions.length) * 100;
  return (matchPercentage / 100) * 25; // Max 25 points
}

// Calculate geographic proximity score (0-20)
function calculateGeographicProximity(
  userLocation: [number, number] | undefined,
  itemLocations: Array<{ coordinates: [number, number] }> | undefined
): number {
  if (!userLocation || !itemLocations || itemLocations.length === 0) {
    return 0;
  }

  // Find the closest location
  let minDistance = Infinity;
  itemLocations.forEach(location => {
    const distance = calculateDistance(
      userLocation[1], userLocation[0], // user lat, lon
      location.coordinates[1], location.coordinates[0] // item lat, lon
    );
    if (distance < minDistance) {
      minDistance = distance;
    }
  });

  // Convert distance to score (closer = higher score)
  // Assume max distance of 1000km for scoring purposes
  const maxDistance = 1000;
  const proximityScore = Math.max(0, maxDistance - minDistance) / maxDistance;
  return proximityScore * 20; // Max 20 points
}

// Calculate publication relevance score (0-10)
function calculatePublicationRelevance(researcherId: string, publications: PublicationDocument[]): number {
  // In a real implementation, this would check how many publications the researcher has
  // that are relevant to the search query
  const relevantPublications = publications.filter(pub =>
    pub.researcherId.toString() === researcherId
  );

  // Score based on number of publications (max 5 publications = 10 points)
  return Math.min(relevantPublications.length * 2, 10);
}

// Calculate active trials score (0-5)
function calculateActiveTrialsScore(trialStatus: string): number {
  const activeStatuses = ['recruiting', 'active', 'enrolling'];
  return activeStatuses.includes(trialStatus.toLowerCase()) ? 5 : 0;
}

// Main search function for researchers
// Update SearchFilters interface in types/index.ts or here if defined here
// It is imported from @/types. I should check that file, but I can't easily modify it if it's not in the list.
// Assuming I can modify the usage here.

export async function searchResearchers(filters: SearchFilters & { institution?: string; expertise?: string[] }): Promise<{ items: ResearcherSearchResult[], total: number }> {
  const { query, location, conditions, page = 1, limit = 10, radius, institution, expertise } = filters;

  // Build search query
  const searchQuery: Record<string, unknown> = {
    role: 'researcher'
  };

  // Add text search if query provided
  if (query) {
    searchQuery.$or = [
      { firstName: { $regex: query, $options: 'i' } },
      { lastName: { $regex: query, $options: 'i' } },
      { institution: { $regex: query, $options: 'i' } },
      { bio: { $regex: query, $options: 'i' } },
      { expertise: { $in: query.split(' ') } }
    ];
  }

  // Add expertise filter
  if (expertise && expertise.length > 0) {
    searchQuery.expertise = { $in: expertise };
  } else if (conditions && conditions.length > 0) {
    // Fallback to conditions if expertise not explicitly set (legacy behavior)
    searchQuery.expertise = { $in: conditions };
  }

  // Add institution filter
  if (institution) {
    searchQuery.institution = { $regex: institution, $options: 'i' };
  }

  // Add location filter if provided
  if (location) {
    searchQuery['location.coordinates'] = { $exists: true };
  }

  // Perform search with pagination
  const skip = (page - 1) * limit;
  const researchers = await User.find(searchQuery)
    .skip(skip)
    .limit(limit)
    .lean();

  // Calculate match percentages and filter by radius if needed
  let results: ResearcherSearchResult[] = await Promise.all(
    researchers.map(async (researcher: Record<string, unknown>) => {
      let matchPercentage = 0;

      if (query) {
        // Keyword relevance (40% weight)
        matchPercentage += calculateKeywordRelevance(
          query,
          `${researcher.firstName || ''} ${researcher.lastName || ''}`,
          `${researcher.bio || ''} ${researcher.institution || ''}`
        );

        // Publication relevance (10% weight)
        const publications = await Publication.find({ researcherId: researcher._id });
        matchPercentage += calculatePublicationRelevance((researcher._id as unknown as Types.ObjectId).toString(), publications as PublicationDocument[]);
      }

      // Expertise/Condition match (25% weight)
      const targetExpertise = expertise && expertise.length > 0 ? expertise : conditions;
      if (targetExpertise && targetExpertise.length > 0) {
        matchPercentage += calculateConditionMatch(targetExpertise, (researcher.expertise as string[]) || []);
      }

      // Geographic proximity (20% weight)
      if (location && researcher.location) {
        matchPercentage += calculateGeographicProximity(
          location.coordinates,
          [researcher.location as Location]
        );
      }

      // Add distance if location provided
      let distance: number | undefined;
      if (location && researcher.location) {
        distance = calculateDistance(
          location.coordinates[1],
          location.coordinates[0],
          (researcher.location as Location).coordinates[1],
          (researcher.location as Location).coordinates[0]
        );
      }

      return {
        ...researcher,
        matchPercentage: Math.min(Math.round(matchPercentage), 100),
        distance
      } as ResearcherSearchResult;
    })
  );

  // Filter by radius if specified
  if (location && radius) {
    results = results.filter(researcher =>
      researcher.distance !== undefined && researcher.distance <= radius
    );
  }

  // Sort by match percentage (descending) or distance if specified
  if (filters.sortBy === 'distance' && location) {
    results.sort((a, b) => {
      if (a.distance === undefined) return 1;
      if (b.distance === undefined) return -1;
      return a.distance - b.distance;
    });
  } else {
    results.sort((a, b) => b.matchPercentage - a.matchPercentage);
  }

  return {
    items: results,
    total: results.length
  };
}

export async function searchPatients(filters: SearchFilters): Promise<{ items: ResearcherSearchResult[], total: number }> {
  const { query, location, conditions, page = 1, limit = 10, radius } = filters;

  // Build search query
  const searchQuery: Record<string, unknown> = {
    role: 'patient'
  };

  // Add text search if query provided
  if (query) {
    searchQuery.$or = [
      { firstName: { $regex: query, $options: 'i' } },
      { lastName: { $regex: query, $options: 'i' } },
      { bio: { $regex: query, $options: 'i' } },
      { conditions: { $in: query.split(' ') } }
    ];
  }

  // Add condition filter if provided
  if (conditions && conditions.length > 0) {
    searchQuery.conditions = { $in: conditions };
  }

  // Add location filter if provided
  if (location) {
    searchQuery['location.coordinates'] = { $exists: true };
  }

  // Perform search with pagination
  const skip = (page - 1) * limit;
  const patients = await User.find(searchQuery)
    .skip(skip)
    .limit(limit)
    .lean();

  // Calculate match percentages and filter by radius if needed
  let results: ResearcherSearchResult[] = await Promise.all(
    patients.map(async (patient: Record<string, unknown>) => {
      let matchPercentage = 0;

      if (query) {
        // Keyword relevance (40% weight)
        matchPercentage += calculateKeywordRelevance(
          query,
          `${patient.firstName || ''} ${patient.lastName || ''}`,
          `${patient.bio || ''}`
        );
      }

      // Condition match (25% weight)
      if (conditions && conditions.length > 0) {
        matchPercentage += calculateConditionMatch(conditions, (patient.conditions as string[]) || []);
      }

      // Geographic proximity (20% weight)
      if (location && patient.location) {
        matchPercentage += calculateGeographicProximity(
          location.coordinates,
          [patient.location as Location]
        );
      }

      // Add distance if location provided
      let distance: number | undefined;
      if (location && patient.location) {
        distance = calculateDistance(
          location.coordinates[1],
          location.coordinates[0],
          (patient.location as Location).coordinates[1],
          (patient.location as Location).coordinates[0]
        );
      }

      return {
        ...patient,
        matchPercentage: Math.min(Math.round(matchPercentage), 100),
        distance
      } as ResearcherSearchResult;
    })
  );

  // Filter by radius if specified
  if (location && radius) {
    results = results.filter(patient =>
      patient.distance !== undefined && patient.distance <= radius
    );
  }

  // Sort by match percentage (descending) or distance if specified
  if (filters.sortBy === 'distance' && location) {
    results.sort((a, b) => {
      if (a.distance === undefined) return 1;
      if (b.distance === undefined) return -1;
      return a.distance - b.distance;
    });
  } else {
    results.sort((a, b) => b.matchPercentage - a.matchPercentage);
  }

  return {
    items: results,
    total: results.length
  };
}

// Main search function for trials
export async function searchTrials(filters: SearchFilters): Promise<{ items: TrialSearchResult[], total: number }> {
  const { query, location, conditions, page = 1, limit = 10, radius } = filters;

  // Build search query
  const searchQuery: Record<string, unknown> = {};

  // Add text search if query provided
  if (query) {
    searchQuery.$text = { $search: query };
  }

  // Add condition filter if provided
  if (conditions && conditions.length > 0) {
    searchQuery.conditions = { $in: conditions };
  }

  // Add location filter if provided
  if (location) {
    searchQuery['locations.coordinates'] = { $exists: true };
  }

  // Perform search with pagination
  const skip = (page - 1) * limit;
  const trials = await Trial.find(searchQuery)
    .skip(skip)
    .limit(limit)
    .lean();

  // Calculate match percentages and filter by radius if needed
  let results: TrialSearchResult[] = trials.map((trial: Record<string, unknown>) => {
    let matchPercentage = 0;

    if (query) {
      // Keyword relevance (40% weight)
      matchPercentage += calculateKeywordRelevance(
        query,
        trial.title as string || '',
        trial.summary as string || ''
      );
    }

    // Condition match (25% weight)
    if (conditions && conditions.length > 0) {
      matchPercentage += calculateConditionMatch(conditions, (trial.conditions as string[]) || []);
    }

    // Geographic proximity (20% weight)
    if (location && trial.locations) {
      matchPercentage += calculateGeographicProximity(
        location.coordinates,
        trial.locations as Location[]
      );
    }

    // Active trials score (5% weight)
    matchPercentage += calculateActiveTrialsScore(trial.status as string || '');

    // Add distance if location provided
    let distance: number | undefined;
    if (location && trial.locations && (trial.locations as Location[]).length > 0) {
      // Use the closest location
      let minDistance = Infinity;
      (trial.locations as Location[]).forEach((loc: Location) => {
        const d = calculateDistance(
          location.coordinates[1],
          location.coordinates[0],
          loc.coordinates[1],
          loc.coordinates[0]
        );
        if (d < minDistance) {
          minDistance = d;
        }
      });
      distance = minDistance;
    }

    return {
      ...trial,
      matchPercentage: Math.min(Math.round(matchPercentage), 100),
      distance
    } as TrialSearchResult;
  });

  // Filter by radius if specified
  if (location && radius) {
    results = results.filter(trial =>
      trial.distance !== undefined && trial.distance <= radius
    );
  }

  // Sort by match percentage (descending) or distance if specified
  if (filters.sortBy === 'distance' && location) {
    results.sort((a, b) => {
      if (a.distance === undefined) return 1;
      if (b.distance === undefined) return -1;
      return a.distance - b.distance;
    });
  } else {
    results.sort((a, b) => b.matchPercentage - a.matchPercentage);
  }

  return {
    items: results,
    total: results.length
  };
}

// Main search function for publications
export async function searchPublications(filters: SearchFilters): Promise<{ items: PublicationSearchResult[], total: number }> {
  const { query, conditions, page = 1, limit = 10 } = filters;

  // Build search query
  const searchQuery: Record<string, unknown> = {};

  // Add text search if query provided
  if (query) {
    searchQuery.$text = { $search: query };
  }

  // Add condition filter if provided
  if (conditions && conditions.length > 0) {
    searchQuery.conditions = { $in: conditions };
  }

  // Perform search with pagination
  const skip = (page - 1) * limit;
  const publications = await Publication.find(searchQuery)
    .skip(skip)
    .limit(limit)
    .populate('researcherId', 'firstName lastName institution')
    .lean();

  // Calculate match percentages
  const results: PublicationSearchResult[] = publications.map((publication: Record<string, unknown>) => {
    let matchPercentage = 0;

    if (query) {
      // Keyword relevance (60% weight)
      matchPercentage += calculateKeywordRelevance(
        query,
        publication.title as string || '',
        publication.abstract as string || ''
      );
    }

    // Condition match (40% weight)
    if (conditions && conditions.length > 0) {
      matchPercentage += calculateConditionMatch(conditions, (publication.conditions as string[]) || []);
    }

    return {
      ...publication,
      matchPercentage: Math.min(Math.round(matchPercentage), 100)
    } as PublicationSearchResult;
  });

  // Sort by match percentage (descending)
  results.sort((a, b) => b.matchPercentage - a.matchPercentage);

  return {
    items: results,
    total: results.length
  };
}

// Get search suggestions
export async function getSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
  // In a real implementation, this would query the database for suggestions
  // For now, we'll return mock data
  return [
    { type: 'researcher', text: `Researcher: ${query}` },
    { type: 'trial', text: `Trial: ${query}` },
    { type: 'publication', text: `Publication: ${query}` },
    { type: 'condition', text: `Condition: ${query}` }
  ];
}