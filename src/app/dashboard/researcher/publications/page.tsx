'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus, Import, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { Publication } from '@/types';
import { ImportDialog, AddManuallyDialog, PublicationsList } from './components';

export default function PublicationsManagementPage() {
  const { user, loading: authLoading } = useAuth();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [filteredPublications, setFilteredPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'citations' | 'title'>('date');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const response = await fetch('/api/publications/mine');
        if (!response.ok) throw new Error('Failed to fetch publications');
        const data = await response.json();
        setPublications(data);
        setFilteredPublications(data);
      } catch (error) {
        toast.error('Error', {
          description: error instanceof Error ? error.message : 'Failed to fetch publications',
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchPublications();
    }
  }, [user]);

  useEffect(() => {
    // Filter and sort publications
    let result = [...publications];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(pub =>
        pub.title.toLowerCase().includes(query) ||
        pub.authors.some(author => author.toLowerCase().includes(query)) ||
        pub.journal.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime();
        case 'citations':
          return (b.citations || 0) - (a.citations || 0);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredPublications(result);
  }, [publications, searchQuery, sortBy]);

  if (authLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You need to be logged in as a researcher to manage publications.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/auth/signin'}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleImportSuccess = (newPublications: Publication[]) => {
    setPublications(prev => [...newPublications, ...prev]);
    toast.success('Success', {
      description: `Imported ${newPublications.length} publications`,
    });
  };

  const handleAddSuccess = (newPublication: Publication) => {
    setPublications(prev => [newPublication, ...prev]);
    toast.success('Success', {
      description: 'Publication added successfully',
    });
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/publications/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete publication');

      setPublications(prev => prev.filter(pub => pub._id !== id));
      toast.success('Success', {
        description: 'Publication deleted successfully',
      });
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to delete publication',
      });
    }
  };

  const handleUpdate = async (id: string, updates: Partial<Publication>) => {
    try {
      const response = await fetch(`/api/publications/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update publication');

      const updatedPublication = await response.json();
      setPublications(prev => prev.map(pub => pub._id === id ? updatedPublication : pub));
      toast.success('Success', {
        description: 'Publication updated successfully',
      });
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to update publication',
      });
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Publication Management</h1>
        <p className="text-muted-foreground">
          Manage your research publications and import from PubMed
        </p>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search publications..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setShowImportDialog(true)}>
            <Import className="mr-2 h-4 w-4" />
            Import from PubMed
          </Button>
          <Button variant="outline" onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Manually
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-muted-foreground mr-3" />
              <div>
                <p className="text-2xl font-bold">{publications.length}</p>
                <p className="text-sm text-muted-foreground">Total Publications</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <span className="text-blue-600 font-bold text-sm">
                  {publications.reduce((sum, pub) => sum + (pub.citations || 0), 0)}
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {publications.reduce((sum, pub) => sum + (pub.citations || 0), 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Citations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                <span className="text-green-600 font-bold text-sm">
                  {publications.filter(pub => pub.pmid).length}
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {publications.filter(pub => pub.pmid).length}
                </p>
                <p className="text-sm text-muted-foreground">PubMed Linked</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Publications List */}
      <PublicationsList
        publications={filteredPublications}
        loading={loading}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
        onImport={() => setShowImportDialog(true)}
        onAddManual={() => setShowAddDialog(true)}
      />

      {/* Dialogs */}
      <ImportDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onImportSuccess={handleImportSuccess}
      />

      <AddManuallyDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAddSuccess={handleAddSuccess}
      />
    </div>
  );
}