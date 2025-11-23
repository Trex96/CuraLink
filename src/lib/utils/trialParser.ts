// Utility functions for parsing ClinicalTrials.gov data

// Parse eligibility criteria from text
export function parseEligibilityCriteria(criteriaText: string): string[] {
  try {
    if (!criteriaText) return [];
    
    // Split by common delimiters using a more compatible regex
    const delimiterRegex = new RegExp('\\n\\n|\\n-|[•*]|\\\\n\\\\n|\\\\n-');
    const cleanupRegex = new RegExp('^[-•*]+');
    
    const criteria = criteriaText
      .split(delimiterRegex)
      .map(c => c.trim())
      .filter(c => c.length > 0)
      .map(c => c.replace(cleanupRegex, '').trim());
    
    // If we have very few criteria, try splitting by sentences
    if (criteria.length < 3) {
      return criteriaText
        .split(/[.!?]+/)
        .map(c => c.trim())
        .filter(c => c.length > 10); // Filter out very short fragments
    }
    
    return criteria;
  } catch (error) {
    console.error('Error parsing eligibility criteria:', error);
    return [criteriaText];
  }
}

// Parse locations from ClinicalTrials.gov data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseLocations(locationData: Record<string, any>): Array<{ 
  coordinates: [number, number]; 
  address: string 
}> {
  try {
    const locations: Array<{ coordinates: [number, number]; address: string }> = [];
    
    if (!locationData || !locationData.LocationList) {
      return locations;
    }
    
    for (const location of locationData.LocationList) {
      const facility = location.LocationFacility || '';
      const city = location.LocationCity || '';
      const state = location.LocationState || '';
      const country = location.LocationCountry || '';
      const zip = location.LocationZip || '';
      
      const addressParts = [facility, city, state, zip, country].filter(part => part);
      const address = addressParts.join(', ') || 'Location not specified';
      
      // For coordinates, we would need to geocode the address in a real implementation
      // For now, we'll use dummy coordinates
      locations.push({
        coordinates: [Math.random() * 360 - 180, Math.random() * 180 - 90],
        address
      });
    }
    
    return locations;
  } catch (error) {
    console.error('Error parsing locations:', error);
    return [];
  }
}

// Extract interventions from ClinicalTrials.gov data
export function extractInterventions(interventionList: unknown[]): string[] {
  try {
    if (!interventionList || !Array.isArray(interventionList)) {
      return [];
    }
    
    return interventionList
      .map((intervention: unknown) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const interventionAny = intervention as any;
        return interventionAny.InterventionName;
      })
      .filter((name: unknown) => name && typeof name === 'string');
  } catch (error) {
    console.error('Error extracting interventions:', error);
    return [];
  }
}

// Extract conditions from ClinicalTrials.gov data
export function extractConditions(conditionList: string[]): string[] {
  try {
    if (!conditionList || !Array.isArray(conditionList)) {
      return [];
    }
    
    return conditionList.filter(condition => condition && typeof condition === 'string');
  } catch (error) {
    console.error('Error extracting conditions:', error);
    return [];
  }
}

// Parse contact information
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseContactInfo(contacts: Record<string, any>[]): string {
  try {
    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return 'Contact information not available';
    }
    
    const primaryContact = contacts[0];
    const contactParts = [];
    
    if (primaryContact.OverallOfficialName) {
      contactParts.push(primaryContact.OverallOfficialName);
    }
    
    if (primaryContact.OverallOfficialAffiliation) {
      contactParts.push(primaryContact.OverallOfficialAffiliation);
    }
    
    if (primaryContact.OverallOfficialPhone) {
      contactParts.push(`Phone: ${primaryContact.OverallOfficialPhone}`);
    }
    
    if (primaryContact.OverallOfficialEMail) {
      contactParts.push(`Email: ${primaryContact.OverallOfficialEMail}`);
    }
    
    return contactParts.join(', ') || 'Contact information not available';
  } catch (error) {
    console.error('Error parsing contact info:', error);
    return 'Contact information not available';
  }
}

// Parse sponsors from ClinicalTrials.gov data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseSponsors(sponsorModule: Record<string, any>): string[] {
  try {
    const sponsors: string[] = [];
    
    if (!sponsorModule) {
      return sponsors;
    }
    
    // Extract lead sponsor
    if (sponsorModule.LeadSponsor && sponsorModule.LeadSponsor.LeadSponsorName) {
      sponsors.push(sponsorModule.LeadSponsor.LeadSponsorName);
    }
    
    // Extract collaborators
    if (sponsorModule.CollaboratorList && Array.isArray(sponsorModule.CollaboratorList)) {
      for (const collaborator of sponsorModule.CollaboratorList) {
        if (collaborator.CollaboratorName) {
          sponsors.push(collaborator.CollaboratorName);
        }
      }
    }
    
    return sponsors;
  } catch (error) {
    console.error('Error parsing sponsors:', error);
    return [];
  }
}

const trialParser = {
  parseEligibilityCriteria,
  parseLocations,
  extractInterventions,
  extractConditions,
  parseContactInfo,
  parseSponsors
};

export default trialParser;