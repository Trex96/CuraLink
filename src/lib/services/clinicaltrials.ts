// ClinicalTrials.gov v2 Data API
// Documentation: https://clinicaltrials.gov/data-api/api

const API_BASE_URL = 'https://clinicaltrials.gov/api/v2';

// Import required utilities
import { ncbiRateLimiter } from '@/lib/utils/rateLimiter';
import { retryWithBackoff } from '@/lib/utils/retry';
import TrialModel from '@/models/trial/Trial';

interface Location {
  coordinates: [number, number];
  address: string;
}

export interface ClinicalTrial {
  nctNumber: string;
  title: string;
  summary: string;
  status: string;
  phase: string;
  locations: Location[];
  eligibilityCriteria: string[];
  contactInfo: string;
  conditions: string[];
  interventions: string[];
  lastUpdated: string;
  detailedDescription?: string;
  sponsors?: string[];
  startDate?: string;
  endDate?: string;
  enrollment?: number;
  studyType?: string;
}

interface SearchParams {
  disease?: string;
  location?: string;
  status?: string;
  phase?: string;
  studyType?: string;
  piName?: string;
  institution?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Search trials using ClinicalTrials.gov v2 API
 */
export async function searchTrials(params: SearchParams): Promise<ClinicalTrial[]> {
  try {
    const {
      disease,
      location,
      status,
      phase,
      studyType,
      piName,
      institution,

      pageSize = 20
    } = params;

    // Wait for rate limiter
    await ncbiRateLimiter.wait();

    // Build query parameters
    const queryParams = new URLSearchParams();

    if (disease) {
      queryParams.append('query.cond', disease);
    }

    if (location) {
      queryParams.append('query.locn', location);
    }

    if (status) {
      queryParams.append('filter.overallStatus', status);
    }

    if (phase) {
      queryParams.append('filter.phase', phase);
    }

    if (studyType) {
      queryParams.append('filter.studyType', studyType);
    }

    if (piName) {
      queryParams.append('query.lead', piName);
    }

    if (institution) {
      queryParams.append('query.lead', institution);
    }

    // Pagination
    queryParams.append('pageSize', pageSize.toString());
    // queryParams.append('pageToken', ((page - 1) * pageSize).toString()); // Incorrect for v2 API

    // Request specific fields
    queryParams.append('fields', 'NCTId,BriefTitle,OfficialTitle,BriefSummary,DetailedDescription,OverallStatus,Phase,Condition,InterventionName,StartDate,CompletionDate,EnrollmentCount,StudyType,LeadSponsorName,LocationFacility,LocationCity,LocationState,LocationCountry,LocationZip,EligibilityCriteria,LastUpdatePostDate');

    // Format as JSON
    queryParams.append('format', 'json');

    const url = `${API_BASE_URL}/studies?${queryParams.toString()}`;

    // Fetch with retry
    const data = await retryWithBackoff(async () => {
      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ClinicalTrials.gov API error: ${response.status} - ${errorText}`);
      }
      return await response.json();
    });

    return parseSearchResults(data);
  } catch (error) {
    console.error('Error searching ClinicalTrials.gov:', error);
    throw new Error('Failed to search ClinicalTrials.gov: ' + (error as Error).message);
  }
}

/**
 * Fetch detailed trial information by NCT Number
 */
export async function fetchTrialDetails(nctNumber: string): Promise<ClinicalTrial> {
  try {
    // Check cache first
    const cachedTrial = await getCachedTrial(nctNumber);
    if (cachedTrial) {
      return cachedTrial;
    }

    // Wait for rate limiter
    await ncbiRateLimiter.wait();

    const url = `${API_BASE_URL}/studies/${nctNumber}?format=json`;

    // Fetch with retry
    const data = await retryWithBackoff(async () => {
      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch trial ${nctNumber}: ${response.status} - ${errorText}`);
      }
      return await response.json();
    });

    const trial = parseStudyDetails(data);

    // Cache the trial
    await cacheTrial(trial);

    return trial;
  } catch (error) {
    console.error(`Error fetching trial ${nctNumber}:`, error);
    throw new Error(`Failed to fetch trial ${nctNumber}: ` + (error as Error).message);
  }
}

/**
 * Parse search results from v2 API
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseSearchResults(apiResponse: any): ClinicalTrial[] {
  try {
    const trials: ClinicalTrial[] = [];

    if (!apiResponse || !apiResponse.studies) {
      return trials;
    }

    for (const study of apiResponse.studies) {
      const protocolSection = study.protocolSection || {};
      const trial = extractTrialData(protocolSection);
      if (trial) {
        trials.push(trial);
      }
    }

    return trials;
  } catch (error) {
    console.error('Error parsing search results:', error);
    return [];
  }
}

/**
 * Parse single study details from v2 API
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseStudyDetails(apiResponse: any): ClinicalTrial {
  try {
    if (!apiResponse || !apiResponse.protocolSection) {
      throw new Error('Invalid study data structure');
    }

    const trial = extractTrialData(apiResponse.protocolSection);
    if (!trial) {
      throw new Error('Failed to extract trial data');
    }

    return trial;
  } catch (error) {
    console.error('Error parsing study details:', error);
    throw error;
  }
}

/**
 * Extract trial data from protocol section
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractTrialData(protocolSection: any): ClinicalTrial | null {
  try {
    // Identification Module
    const identificationModule = protocolSection.identificationModule || {};
    const nctId = identificationModule.nctId || '';
    const briefTitle = identificationModule.briefTitle || '';
    const officialTitle = identificationModule.officialTitle || '';
    const title = officialTitle || briefTitle;

    if (!nctId || !title) {
      return null;
    }

    // Status Module
    const statusModule = protocolSection.statusModule || {};
    const overallStatus = statusModule.overallStatus || 'Unknown';
    const lastUpdatePostDate = statusModule.lastUpdatePostDate || new Date().toISOString();
    const startDateStruct = statusModule.startDateStruct || {};
    const completionDateStruct = statusModule.completionDateStruct || {};
    const startDate = startDateStruct.date || '';
    const completionDate = completionDateStruct.date || '';

    // Description Module
    const descriptionModule = protocolSection.descriptionModule || {};
    const briefSummary = descriptionModule.briefSummary || '';
    const detailedDescription = descriptionModule.detailedDescription || '';

    // Design Module
    const designModule = protocolSection.designModule || {};
    const studyType = designModule.studyType || 'Unknown';
    const phases = designModule.phases || [];
    const phase = phases.length > 0 ? phases.join(', ') : 'N/A';
    const enrollmentInfo = designModule.enrollmentInfo || {};
    const enrollment = enrollmentInfo.count ? parseInt(enrollmentInfo.count) : undefined;

    // Conditions Module
    const conditionsModule = protocolSection.conditionsModule || {};
    const conditions = conditionsModule.conditions || [];

    // Arms/Interventions Module
    const armsInterventionsModule = protocolSection.armsInterventionsModule || {};
    const interventions: string[] = [];
    if (armsInterventionsModule.interventions) {
      for (const intervention of armsInterventionsModule.interventions) {
        if (intervention.name) {
          interventions.push(intervention.name);
        }
      }
    }

    // Eligibility Module
    const eligibilityModule = protocolSection.eligibilityModule || {};
    const eligibilityCriteria = extractEligibilityCriteria(
      eligibilityModule.eligibilityCriteria || ''
    );

    // Contacts/Locations Module
    const contactsLocationsModule = protocolSection.contactsLocationsModule || {};
    const locations = extractLocations(contactsLocationsModule.locations || []);

    // Contact Info
    let contactInfo = 'Contact information not available';
    if (contactsLocationsModule.centralContacts && contactsLocationsModule.centralContacts.length > 0) {
      const contact = contactsLocationsModule.centralContacts[0];
      const contactParts = [];
      if (contact.name) contactParts.push(contact.name);
      if (contact.phone) contactParts.push(contact.phone);
      if (contact.email) contactParts.push(contact.email);
      if (contactParts.length > 0) {
        contactInfo = contactParts.join(', ');
      }
    }

    // Sponsor Module
    const sponsorCollaboratorsModule = protocolSection.sponsorCollaboratorsModule || {};
    const sponsors: string[] = [];
    if (sponsorCollaboratorsModule.leadSponsor) {
      sponsors.push(sponsorCollaboratorsModule.leadSponsor.name);
    }
    if (sponsorCollaboratorsModule.collaborators) {
      for (const collaborator of sponsorCollaboratorsModule.collaborators) {
        if (collaborator.name) {
          sponsors.push(collaborator.name);
        }
      }
    }

    return {
      nctNumber: nctId,
      title,
      summary: briefSummary,
      status: overallStatus,
      phase,
      locations,
      eligibilityCriteria,
      contactInfo,
      conditions,
      interventions,
      lastUpdated: lastUpdatePostDate,
      detailedDescription,
      sponsors,
      startDate,
      endDate: completionDate,
      enrollment,
      studyType
    };
  } catch (error) {
    console.error('Error extracting trial data:', error);
    return null;
  }
}

/**
 * Extract eligibility criteria from text
 */
export function extractEligibilityCriteria(criteriaText: string): string[] {
  try {
    if (!criteriaText) return [];

    // Split by common patterns
    const criteria = criteriaText
      .split(/\n\n+|\n-|\n\*|•/)
      .map(c => c.trim())
      .filter(c => c.length > 10)
      .map(c => c.replace(/^[-•*\s]+/, '').trim());

    // If we have very few criteria, try splitting by sentences
    if (criteria.length < 3) {
      return criteriaText
        .split(/[.!?]+/)
        .map(c => c.trim())
        .filter(c => c.length > 20);
    }

    return criteria;
  } catch (error) {
    console.error('Error extracting eligibility criteria:', error);
    return [criteriaText];
  }
}

/**
 * Extract locations from location data
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractLocations(locationData: any[]): Location[] {
  try {
    const locations: Location[] = [];

    for (const location of locationData) {
      const facility = location.facility || '';
      const city = location.city || '';
      const state = location.state || '';
      const country = location.country || '';
      const zip = location.zip || '';

      const addressParts = [facility, city, state, zip, country].filter(part => part);
      const address = addressParts.join(', ') || 'Location not specified';

      // For now, use dummy coordinates (in production, use geocoding service)
      locations.push({
        coordinates: [0, 0], // TODO: Implement geocoding
        address
      });
    }

    return locations;
  } catch (error) {
    console.error('Error extracting locations:', error);
    return [];
  }
}

/**
 * Cache trial in MongoDB
 */
async function cacheTrial(trial: ClinicalTrial): Promise<void> {
  try {
    const existing = await TrialModel.findOne({ nctNumber: trial.nctNumber });

    if (existing) {
      await TrialModel.findOneAndUpdate(
        { nctNumber: trial.nctNumber },
        {
          ...trial,
          lastUpdated: new Date(trial.lastUpdated)
        }
      );
    } else {
      await TrialModel.create({
        ...trial,
        lastUpdated: new Date(trial.lastUpdated)
      });
    }
  } catch (error) {
    console.warn('Failed to cache trial:', error);
  }
}

/**
 * Get cached trial from MongoDB
 */
async function getCachedTrial(nctNumber: string): Promise<ClinicalTrial | null> {
  try {
    const trial = await TrialModel.findOne({ nctNumber });
    if (trial) {
      // Check if cache is still valid (less than 24 hours old)
      const now = new Date().getTime();
      const cacheTime = trial.lastUpdated.getTime();
      const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours

      if (now - cacheTime < CACHE_EXPIRATION) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const trialAny = trial as any;

        return {
          nctNumber: trial.nctNumber,
          title: trial.title,
          summary: trial.summary,
          status: trial.status,
          phase: trial.phase,
          locations: trial.locations.map(loc => ({
            coordinates: [loc.coordinates[0], loc.coordinates[1]],
            address: loc.address || ''
          })),
          eligibilityCriteria: trial.eligibilityCriteria,
          contactInfo: trial.contactInfo,
          conditions: trial.conditions,
          interventions: trial.interventions,
          lastUpdated: trial.lastUpdated.toISOString(),
          detailedDescription: trialAny.detailedDescription,
          sponsors: trialAny.sponsors,
          startDate: trialAny.startDate,
          endDate: trialAny.endDate,
          enrollment: trialAny.enrollment,
          studyType: trialAny.studyType
        };
      }
    }
    return null;
  } catch (error) {
    console.warn('Failed to get cached trial:', error);
    return null;
  }
}

/**
 * Search trials by Principal Investigator name
 */
export async function searchTrialsByPI(
  piName: string,
  maxResults: number = 20
): Promise<ClinicalTrial[]> {
  try {
    return await searchTrials({
      piName,
      pageSize: maxResults
    });
  } catch (error) {
    console.error('Error searching by PI:', error);
    throw new Error('Failed to search by PI: ' + (error as Error).message);
  }
}

/**
 * Search trials by institution
 */
export async function searchTrialsByInstitution(
  institution: string,
  maxResults: number = 20
): Promise<ClinicalTrial[]> {
  try {
    return await searchTrials({
      institution,
      pageSize: maxResults
    });
  } catch (error) {
    console.error('Error searching by institution:', error);
    throw new Error('Failed to search by institution: ' + (error as Error).message);
  }
}

/**
 * Search trials by condition/disease
 */
export async function searchTrialsByCondition(
  condition: string,
  maxResults: number = 20
): Promise<ClinicalTrial[]> {
  try {
    return await searchTrials({
      disease: condition,
      pageSize: maxResults
    });
  } catch (error) {
    console.error('Error searching by condition:', error);
    throw new Error('Failed to search by condition: ' + (error as Error).message);
  }
}