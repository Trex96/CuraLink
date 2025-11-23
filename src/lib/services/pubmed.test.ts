// Test file demonstrating the usage of the PubMed service
import { searchPubMedByAuthor, searchPubMedByOrcid, fetchPublicationByPMID } from './pubmed';

// Example usage of the PubMed service
async function testPubMedService() {
  try {
    console.log('Testing PubMed service...');
    
    // Search by author name
    console.log('Searching by author name...');
    const authorResults = await searchPubMedByAuthor('John Smith', 5);
    console.log(`Found ${authorResults.length} publications by author`);
    
    // Search by ORCID
    console.log('Searching by ORCID...');
    const orcidResults = await searchPubMedByOrcid('0000-0002-1825-0097', 5);
    console.log(`Found ${orcidResults.length} publications by ORCID`);
    
    // Fetch a specific publication by PMID
    if (authorResults.length > 0) {
      console.log('Fetching specific publication...');
      const publication = await fetchPublicationByPMID(authorResults[0].pmid);
      if (publication) {
        console.log(`Fetched publication: ${publication.title}`);
      }
    }
    
    console.log('PubMed service test completed successfully');
  } catch (error) {
    console.error('Error testing PubMed service:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testPubMedService();
}

export default testPubMedService;