import { Publication } from '@/types';
import { ncbiRateLimiter } from '@/lib/utils/rateLimiter';
import { retryWithBackoff } from '@/lib/utils/retry';
import { parsePubMedXML as parseXML } from '@/lib/utils/xmlParser';

// NCBI E-utilities base URL
const BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

// PubMed search function by author name
export async function searchPubMedByAuthor(
  authorName: string,
  maxResults: number = 20
): Promise<Publication[]> {
  try {
    // Wait for rate limiter
    await ncbiRateLimiter.wait();

    // Construct the search query
    const query = `${authorName}[Author]`;
    const searchUrl = `${BASE_URL}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${maxResults}&retmode=json&sort=pubdate`;

    // Fetch search results with retry
    const searchData = await retryWithBackoff(async () => {
      const searchResponse = await fetch(searchUrl);
      if (!searchResponse.ok) {
        throw new Error(`Failed to search PubMed: ${searchResponse.statusText}`);
      }
      return await searchResponse.json();
    });

    const pmids = searchData.esearchresult?.idlist || [];

    if (pmids.length === 0) {
      return [];
    }

    // Fetch detailed information for each publication
    return await fetchPublicationsByPMIDs(pmids);
  } catch (error) {
    console.error('Error searching PubMed by author:', error);
    throw new Error('Failed to search PubMed by author: ' + (error as Error).message);
  }
}

// PubMed search function by ORCID
export async function searchPubMedByOrcid(
  orcid: string,
  maxResults: number = 20
): Promise<Publication[]> {
  try {
    // Wait for rate limiter
    await ncbiRateLimiter.wait();

    // Construct the search query
    const query = `${orcid}[ORCID]`;
    const searchUrl = `${BASE_URL}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${maxResults}&retmode=json&sort=pubdate`;

    // Fetch search results with retry
    const searchData = await retryWithBackoff(async () => {
      const searchResponse = await fetch(searchUrl);
      if (!searchResponse.ok) {
        throw new Error(`Failed to search PubMed: ${searchResponse.statusText}`);
      }
      return await searchResponse.json();
    });

    const pmids = searchData.esearchresult?.idlist || [];

    if (pmids.length === 0) {
      return [];
    }

    // Fetch detailed information for each publication
    return await fetchPublicationsByPMIDs(pmids);
  } catch (error) {
    console.error('Error searching PubMed by ORCID:', error);
    throw new Error('Failed to search PubMed by ORCID: ' + (error as Error).message);
  }
}

// Fetch detailed publication information by PMIDs
async function fetchPublicationsByPMIDs(pmids: string[]): Promise<Publication[]> {
  try {
    // Process PMIDs in batches to avoid URL length limits
    const batchSize = 200;
    const publications: Publication[] = [];

    for (let i = 0; i < pmids.length; i += batchSize) {
      const batch = pmids.slice(i, i + batchSize);

      // Wait for rate limiter
      await ncbiRateLimiter.wait();

      // Join PMIDs with commas for the fetch request
      const pmidList = batch.join(',');
      const fetchUrl = `${BASE_URL}/efetch.fcgi?db=pubmed&id=${pmidList}&retmode=xml`;

      // Fetch XML data with retry
      const xmlText = await retryWithBackoff(async () => {
        const fetchResponse = await fetch(fetchUrl);
        if (!fetchResponse.ok) {
          throw new Error(`Failed to fetch publication details: ${fetchResponse.statusText}`);
        }
        return await fetchResponse.text();
      });

      // Parse XML
      const parsedPublications = parseXML(xmlText);

      // Convert to Publication interface and add to results
      for (const parsedPub of parsedPublications) {
        const publication: Publication = {
          _id: parsedPub.pmid,
          pmid: parsedPub.pmid,
          title: parsedPub.title,
          abstract: parsedPub.abstract,
          authors: parsedPub.authors.map(author =>
            `${author.foreName || ''} ${author.lastName || ''}`.trim()
          ).filter(name => name.length > 0),
          journal: parsedPub.journal,
          publicationDate: parsedPub.publicationDate,
          doi: parsedPub.doi,
          researcherId: '', // Will be set when saved to database
          citations: 0, // Will be updated later
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        publications.push(publication);
      }
    }

    return publications;
  } catch (error) {
    console.error('Error fetching publication details:', error);
    throw new Error('Failed to fetch publication details: ' + (error as Error).message);
  }
}

// Parse PubMed XML response (exported for backward compatibility)
export function parsePubMedXML(xmlText: string): Publication[] {
  try {
    const parsedPublications = parseXML(xmlText);

    // Convert to Publication interface
    return parsedPublications.map(parsedPub => ({
      _id: parsedPub.pmid,
      pmid: parsedPub.pmid,
      title: parsedPub.title,
      abstract: parsedPub.abstract,
      authors: parsedPub.authors.map(author =>
        `${author.foreName || ''} ${author.lastName || ''}`.trim()
      ).filter(name => name.length > 0),
      journal: parsedPub.journal,
      publicationDate: parsedPub.publicationDate,
      doi: parsedPub.doi,
      researcherId: '', // Will be set when saved to database
      citations: 0, // Will be updated later
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  } catch (error) {
    console.error('Error parsing PubMed XML:', error);
    throw new Error('Failed to parse PubMed XML: ' + (error as Error).message);
  }
}

// Fetch detailed information for a single publication by PMID
export async function fetchPublicationByPMID(pmid: string): Promise<Publication | null> {
  try {
    const publications = await fetchPublicationsByPMIDs([pmid]);
    return publications.length > 0 ? publications[0] : null;
  } catch (error) {
    console.error(`Error fetching publication ${pmid}:`, error);
    return null;
  }
}