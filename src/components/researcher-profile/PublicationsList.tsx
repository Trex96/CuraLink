'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Publication } from './types';

interface PublicationsListProps {
  publications: Publication[];
}

export function PublicationsList({ publications }: PublicationsListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const publicationsPerPage = 5;
  
  // Calculate pagination
  const indexOfLastPublication = currentPage * publicationsPerPage;
  const indexOfFirstPublication = indexOfLastPublication - publicationsPerPage;
  const currentPublications = publications.slice(indexOfFirstPublication, indexOfLastPublication);
  const totalPages = Math.ceil(publications.length / publicationsPerPage);
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  if (publications.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-4">
        No publications found for this researcher.
      </p>
    );
  }
  
  return (
    <div>
      <div className="space-y-4">
        {currentPublications.map((pub) => (
          <div key={pub._id} className="border-b pb-4 last:border-0 last:pb-0">
            <h3 className="font-medium">{pub.title}</h3>
            <p className="text-sm text-muted-foreground">
              {pub.authors.join(', ')}
            </p>
            <div className="flex justify-between items-center mt-1">
              <p className="text-sm">
                {pub.journal}, {new Date(pub.publicationDate).getFullYear()}
              </p>
              {(pub.doi || pub.pmid) && (
                <a 
                  href={pub.doi ? `https://doi.org/${pub.doi}` : `https://pubmed.ncbi.nlm.nih.gov/${pub.pmid}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-600 hover:underline"
                >
                  View Publication
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <Button 
            variant="outline" 
            onClick={handlePrevPage} 
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          
          <Button 
            variant="outline" 
            onClick={handleNextPage} 
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}