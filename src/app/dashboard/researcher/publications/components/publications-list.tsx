'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Publication } from '@/types';
import { PublicationCard } from './publication-card';
import { BookOpen } from 'lucide-react';

interface PublicationsListProps {
  publications: Publication[];
  loading: boolean;
  sortBy: 'date' | 'citations' | 'title';
  onSortChange: (sortBy: 'date' | 'citations' | 'title') => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Publication>) => void;
  onImport: () => void;
  onAddManual: () => void;
}

export function PublicationsList({
  publications,
  loading,
  sortBy,
  onSortChange,
  onDelete,
  onUpdate,
  onImport,
  onAddManual
}: PublicationsListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Pagination
  const totalPages = Math.ceil(publications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPublications = publications.slice(startIndex, endIndex);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Publications</CardTitle>
              <CardDescription>
                Manage your research publications
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (publications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Publications</CardTitle>
              <CardDescription>
                Manage your research publications
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={sortBy} onValueChange={onSortChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Sort by Date</SelectItem>
                  <SelectItem value="citations">Sort by Citations</SelectItem>
                  <SelectItem value="title">Sort by Title</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium">No publications</h3>
            <p className="mt-1 text-sm text-muted-foreground mb-6">
              Get started by importing publications from PubMed or adding them manually.
            </p>
            <div className="flex justify-center gap-4">
              <Button onClick={onImport}>
                Import from PubMed
              </Button>
              <Button variant="outline" onClick={onAddManual}>
                Add Manually
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Publications</CardTitle>
            <CardDescription>
              Showing {publications.length} publication{publications.length !== 1 ? 's' : ''}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="citations">Citations</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentPublications.map((publication) => (
            <PublicationCard
              key={publication._id}
              publication={publication}
              onDelete={onDelete}
              onUpdate={onUpdate}
            />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>

            <div className="flex space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}