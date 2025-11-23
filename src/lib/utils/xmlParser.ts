// XML parser utility for handling PubMed XML responses
import { PubMedAuthor, PubMedPublication } from '@/types';
import { DOMParser } from '@xmldom/xmldom';

export function parsePubMedXML(xmlText: string): PubMedPublication[] {
  try {
    const publications: PubMedPublication[] = [];

    // Create a DOM parser to parse XML (using Node.js compatible DOMParser)
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    // Check for XML parsing errors
    const parserError = xmlDoc.getElementsByTagName('parsererror');
    if (parserError.length > 0) {
      throw new Error('XML parsing error: ' + parserError[0].textContent);
    }

    // Get all PubmedArticle elements
    const articles = xmlDoc.getElementsByTagName('PubmedArticle');

    // Process each article
    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];

      // Extract PMID
      const pmidElement = article.getElementsByTagName('PMID')[0];
      const pmid = pmidElement ? pmidElement.textContent || '' : '';

      // Extract title
      const titleElement = article.getElementsByTagName('ArticleTitle')[0];
      const title = titleElement ? titleElement.textContent || '' : '';

      // Extract abstract
      let abstract = '';
      const abstractElements = article.getElementsByTagName('AbstractText');
      if (abstractElements.length > 0) {
        // Handle structured abstracts
        if (abstractElements.length > 1) {
          const abstractParts: string[] = [];
          for (let j = 0; j < abstractElements.length; j++) {
            const label = abstractElements[j].getAttribute('Label');
            const text = abstractElements[j].textContent || '';
            if (label) {
              abstractParts.push(`${label}: ${text}`);
            } else {
              abstractParts.push(text);
            }
          }
          abstract = abstractParts.join('\n\n');
        } else {
          abstract = abstractElements[0].textContent || '';
        }
      }

      // Extract journal
      const journalElement = article.getElementsByTagName('Title')[0];
      const journal = journalElement ? journalElement.textContent || '' : '';

      // Extract publication date
      let publicationDate = new Date();
      const pubDateElement = article.getElementsByTagName('PubDate')[0];
      if (pubDateElement) {
        const yearElement = pubDateElement.getElementsByTagName('Year')[0];
        const monthElement = pubDateElement.getElementsByTagName('Month')[0];
        const dayElement = pubDateElement.getElementsByTagName('Day')[0];

        const year = yearElement ? yearElement.textContent : '';
        const month = monthElement ? monthElement.textContent : '01';
        const day = dayElement ? dayElement.textContent : '01';

        // Normalize month to 2 digits if it's a name
        let normalizedMonth = month || '01';
        if (month && isNaN(parseInt(month))) {
          // Convert month name to number
          const months: { [key: string]: string } = {
            'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
            'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
            'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
          };
          normalizedMonth = (month && months[month]) || '01';
        }

        if (year) {
          publicationDate = new Date(`${year}-${normalizedMonth}-${day}`);
        }
      }

      // Extract authors
      const authors: PubMedAuthor[] = [];
      const authorListElement = article.getElementsByTagName('AuthorList')[0];
      if (authorListElement) {
        const authorElements = authorListElement.getElementsByTagName('Author');
        for (let j = 0; j < authorElements.length; j++) {
          const author = authorElements[j];
          const lastNameElement = author.getElementsByTagName('LastName')[0];
          const foreNameElement = author.getElementsByTagName('ForeName')[0];
          const initialsElement = author.getElementsByTagName('Initials')[0];

          const authorObj: PubMedAuthor = {};
          if (lastNameElement) authorObj.lastName = lastNameElement.textContent || '';
          if (foreNameElement) authorObj.foreName = foreNameElement.textContent || '';
          if (initialsElement) authorObj.initials = initialsElement.textContent || '';

          // Extract affiliation
          const affiliationElement = author.getElementsByTagName('Affiliation')[0];
          if (affiliationElement) {
            authorObj.affiliation = affiliationElement.textContent || '';
          }

          authors.push(authorObj);
        }
      }

      // Extract DOI
      let doi = '';
      const elocationElements = article.getElementsByTagName('ELocationID');
      for (let j = 0; j < elocationElements.length; j++) {
        const elocationElement = elocationElements[j];
        if (elocationElement.getAttribute('EIdType') === 'doi') {
          doi = elocationElement.textContent || '';
          break;
        }
      }

      // Extract volume, issue, and pages
      const volumeElement = article.getElementsByTagName('Volume')[0];
      const issueElement = article.getElementsByTagName('Issue')[0];
      const pagesElement = article.getElementsByTagName('MedlinePgn')[0];

      const volume = volumeElement ? volumeElement.textContent || '' : '';
      const issue = issueElement ? issueElement.textContent || '' : '';
      const pages = pagesElement ? pagesElement.textContent || '' : '';

      // Extract ISSN
      let issn = '';
      const journalElementFull = article.getElementsByTagName('Journal')[0];
      if (journalElementFull) {
        const issnElement = journalElementFull.getElementsByTagName('ISSN')[0];
        if (issnElement) {
          issn = issnElement.textContent || '';
        }
      }

      // Extract MeSH terms
      const meshTerms: string[] = [];
      const meshHeadingList = article.getElementsByTagName('MeshHeadingList')[0];
      if (meshHeadingList) {
        const meshHeadings = meshHeadingList.getElementsByTagName('MeshHeading');
        for (let j = 0; j < meshHeadings.length; j++) {
          const descriptorName = meshHeadings[j].getElementsByTagName('DescriptorName')[0];
          if (descriptorName) {
            meshTerms.push(descriptorName.textContent || '');
          }
        }
      }

      // Create publication object
      publications.push({
        pmid,
        title,
        abstract,
        authors,
        journal,
        publicationDate,
        doi: doi || undefined,
        volume: volume || undefined,
        issue: issue || undefined,
        pages: pages || undefined,
        issn: issn || undefined,
        meshTerms: meshTerms.length > 0 ? meshTerms : undefined
      });
    }

    return publications;
  } catch (error) {
    console.error('Error parsing PubMed XML:', error);
    throw new Error('Failed to parse PubMed XML: ' + (error as Error).message);
  }
}

// Export as named export instead of default to fix linting warning
const xmlParser = { parsePubMedXML };
export default xmlParser;