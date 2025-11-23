# PubMed API Integration Documentation

## Overview
This document describes the PubMed API integration for importing publications into the Curalink platform. The integration includes search functionality, detailed publication fetching, XML parsing, rate limiting, retry logic, and caching.

## Features
1. Search publications by author name or ORCID
2. Fetch publication details (title, abstract, authors, journal, date, PMID, DOI)
3. Parse XML responses from NCBI E-utilities
4. Handle rate limiting (max 3 requests/second)
5. Retry failed requests with exponential backoff
6. Cache results in MongoDB

## Components

### 1. PubMed Service (`src/lib/services/pubmed.ts`)
Core service that handles all PubMed API interactions.

#### Functions:
- `searchPubMedByAuthor(authorName: string, maxResults?: number)`: Search publications by author name
- `searchPubMedByOrcid(orcid: string, maxResults?: number)`: Search publications by ORCID
- `fetchPublicationByPMID(pmid: string)`: Fetch a single publication by PMID
- `parsePubMedXML(xmlText: string)`: Parse PubMed XML responses

### 2. Rate Limiter (`src/lib/utils/rateLimiter.ts`)
Utility to handle NCBI E-utilities rate limiting (max 3 requests/second).

#### Usage:
```typescript
import { ncbiRateLimiter } from '@/lib/utils/rateLimiter';

// Wait for rate limiter before making request
await ncbiRateLimiter.wait();
```

### 3. Retry Utility (`src/lib/utils/retry.ts`)
Implements exponential backoff for handling failed requests.

#### Usage:
```typescript
import { retryWithBackoff } from '@/lib/utils/retry';

const result = await retryWithBackoff(async () => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Request failed');
  }
  return response.json();
});
```

### 4. XML Parser (`src/lib/utils/xmlParser.ts`)
Parses PubMed XML responses into structured data.

#### Usage:
```typescript
import { parsePubMedXML } from '@/lib/utils/xmlParser';

const publications = parsePubMedXML(xmlText);
```

### 5. Cache Layer
Caching is implemented using MongoDB to store fetched publications and search results.

## API Endpoints

### Import Publications (`src/app/api/publications/import-pubmed/route.ts`)
POST endpoint to import publications from PubMed.

#### Request Body:
```json
{
  "searchMethod": "name" | "orcid",
  "searchTerm": "string",
  "maxResults": number (optional, default: 20)
}
```

#### Response:
```json
{
  "publications": Publication[]
}
```

## Usage Examples

### Search by Author
```typescript
import { searchPubMedByAuthor } from '@/lib/services/pubmed';

const publications = await searchPubMedByAuthor('John Smith', 10);
```

### Search by ORCID
```typescript
import { searchPubMedByOrcid } from '@/lib/services/pubmed';

const publications = await searchPubMedByOrcid('0000-0002-1825-0097', 10);
```

### Fetch Single Publication
```typescript
import { fetchPublicationByPMID } from '@/lib/services/pubmed';

const publication = await fetchPublicationByPMID('12345678');
```

## Error Handling
All functions include proper error handling with descriptive error messages. Failed requests are retried with exponential backoff.

## Rate Limiting
The integration automatically handles NCBI E-utilities rate limiting by waiting between requests to ensure no more than 3 requests per second are made.

## Caching
Results are cached in MongoDB for 24 hours to reduce API calls and improve performance.

## Dependencies
- `next`
- `next-auth`
- `mongoose`
- Browser DOMParser (for XML parsing)

## NCBI E-Utilities Used
- ESearch: Search for publications
- EFetch: Fetch full details
- ESummary: Get summaries (future enhancement)

## Future Enhancements
1. Add ESummary support for lightweight publication fetching
2. Implement more sophisticated caching strategies
3. Add support for additional search filters
4. Implement batch processing for large result sets