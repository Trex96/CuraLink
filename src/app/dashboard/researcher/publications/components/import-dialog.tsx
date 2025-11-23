'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Publication } from '@/types';
import { toast } from 'sonner';
import { Loader2, Search } from 'lucide-react';

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess: (publications: Publication[]) => void;
}

export function ImportDialog({ open, onOpenChange, onImportSuccess }: ImportDialogProps) {
  const [searchMethod, setSearchMethod] = useState<'name' | 'orcid'>('name');
  const [searchTerm, setSearchTerm] = useState('');
  const [maxResults, setMaxResults] = useState('20');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Publication[]>([]);
  const [selectedPublications, setSelectedPublications] = useState<Set<string>>(new Set());
  const [isImporting, setIsImporting] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error('Error', {
        description: 'Please enter a search term',
      });
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch('/api/publications/import-pubmed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchMethod,
          searchTerm,
          maxResults: parseInt(maxResults),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to search publications');
      }

      const data = await response.json();
      setSearchResults(data.publications);

      toast.success('Success', {
        description: `Found ${data.publications.length} publications`,
      });
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to search publications',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPublications(new Set(searchResults.map(pub => pub._id)));
    } else {
      setSelectedPublications(new Set());
    }
  };

  const handleSelectPublication = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedPublications);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedPublications(newSelected);
  };

  const handleImport = async () => {
    if (selectedPublications.size === 0) {
      toast.error('Error', {
        description: 'Please select at least one publication to import',
      });
      return;
    }

    setIsImporting(true);
    try {
      const publicationsToImport = searchResults.filter(pub => selectedPublications.has(pub._id));

      const response = await fetch('/api/publications/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publications: publicationsToImport }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to import publications');
      }

      const data = await response.json();
      onImportSuccess(data.publications);

      if (data.message) {
        toast.info('Info', {
          description: data.message,
        });
      } else {
        toast.success('Success', {
          description: `Imported ${data.publications.length} publications`,
        });
      }

      // Reset form
      setSearchResults([]);
      setSelectedPublications(new Set());
      onOpenChange(false);
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to import publications',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const allSelected = searchResults.length > 0 && selectedPublications.size === searchResults.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>Import Publications from PubMed</DialogTitle>
          <DialogDescription>
            Search and import your publications from PubMed by name or ORCID
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Search Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="searchMethod">Search Method</Label>
                <Select value={searchMethod} onValueChange={(value: 'name' | 'orcid') => setSearchMethod(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Author Name</SelectItem>
                    <SelectItem value="orcid">ORCID</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="searchTerm">
                  {searchMethod === 'name' ? 'Author Name' : 'ORCID'}
                </Label>
                <div className="flex space-x-2">
                  <Input
                    id="searchTerm"
                    placeholder={searchMethod === 'name' ? 'Enter author name' : 'Enter ORCID (e.g., 0000-0002-1825-0097)'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1"
                  />
                  <Button onClick={handleSearch} disabled={isSearching}>
                    {isSearching ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="mr-2 h-4 w-4" />
                    )}
                    Search
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Label htmlFor="maxResults" className="whitespace-nowrap">Max Results:</Label>
              <Select value={maxResults} onValueChange={setMaxResults}>
                <SelectTrigger className="w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg border">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="selectAll"
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label htmlFor="selectAll" className="text-sm font-medium cursor-pointer">
                    Select All ({searchResults.length} found)
                  </Label>
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedPublications.size} selected
                </div>
              </div>

              <div className="border rounded-md overflow-hidden">
                <div className="max-h-[400px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted sticky top-0 z-10 shadow-sm">
                      <tr>
                        <th className="text-left p-3 w-10 font-medium text-muted-foreground"></th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Publication Details</th>
                        <th className="text-right p-3 w-24 font-medium text-muted-foreground">Year</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {searchResults.map((publication) => (
                        <tr
                          key={publication._id}
                          className={`hover:bg-muted/50 transition-colors ${selectedPublications.has(publication._id) ? 'bg-muted/20' : ''}`}
                          onClick={() => handleSelectPublication(publication._id, !selectedPublications.has(publication._id))}
                        >
                          <td className="p-3" onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedPublications.has(publication._id)}
                              onCheckedChange={(checked) => handleSelectPublication(publication._id, checked as boolean)}
                            />
                          </td>
                          <td className="p-3 cursor-pointer">
                            <div className="font-medium line-clamp-2 text-foreground">{publication.title}</div>
                            <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              {publication.authors.join(', ')}
                            </div>
                            <div className="text-xs text-muted-foreground/70 mt-0.5 italic">
                              {publication.journal}
                            </div>
                          </td>
                          <td className="p-3 text-right font-medium text-muted-foreground cursor-pointer">
                            {new Date(publication.publicationDate).getFullYear()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-6 pt-4 border-t bg-background">
          <div className="flex w-full justify-between items-center">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={selectedPublications.size === 0 || isImporting}
              className="min-w-[140px]"
            >
              {isImporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                `Import ${selectedPublications.size > 0 ? `(${selectedPublications.size})` : ''}`
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}