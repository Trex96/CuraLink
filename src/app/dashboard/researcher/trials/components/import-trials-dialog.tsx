'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClinicalTrial } from '@/types';
import { toast } from 'sonner';
import { Loader2, Search, LinkIcon } from 'lucide-react';

interface ImportTrialsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess: (trials: ClinicalTrial[]) => void;
  onLinkSuccess: (trial: ClinicalTrial) => void;
}

export function ImportTrialsDialog({ open, onOpenChange, onImportSuccess, onLinkSuccess }: ImportTrialsDialogProps) {
  const [activeTab, setActiveTab] = useState('import');
  const [searchMethod, setSearchMethod] = useState<'pi' | 'institution'>('pi');
  const [searchTerm, setSearchTerm] = useState('');
  const [nctNumber, setNctNumber] = useState('');
  const [maxResults, setMaxResults] = useState('20');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ClinicalTrial[]>([]);
  const [selectedTrials, setSelectedTrials] = useState<Set<string>>(new Set());
  const [isImporting, setIsImporting] = useState(false);
  const [isLinking, setIsLinking] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error('Error', {
        description: 'Please enter a search term',
      });
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch('/api/trials/import', {
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
        throw new Error(errorData.error || 'Failed to search trials');
      }

      const data = await response.json();
      setSearchResults(data.trials);
      
      toast.success('Success', {
        description: `Found ${data.trials.length} trials`,
      });
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to search trials',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTrials(new Set(searchResults.map(trial => trial.nctNumber)));
    } else {
      setSelectedTrials(new Set());
    }
  };

  const handleSelectTrial = (nctNumber: string, checked: boolean) => {
    const newSelected = new Set(selectedTrials);
    if (checked) {
      newSelected.add(nctNumber);
    } else {
      newSelected.delete(nctNumber);
    }
    setSelectedTrials(newSelected);
  };

  const handleImport = async () => {
    if (selectedTrials.size === 0) {
      toast.error('Error', {
        description: 'Please select at least one trial to import',
      });
      return;
    }

    setIsImporting(true);
    try {
      const trialsToImport = searchResults.filter(trial => selectedTrials.has(trial.nctNumber));
      
      const response = await fetch('/api/trials/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trials: trialsToImport }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to import trials');
      }

      const data = await response.json();
      onImportSuccess(data.trials);
      
      toast.success('Success', {
        description: `Imported ${data.trials.length} trials`,
      });
      
      // Reset form
      setSearchResults([]);
      setSelectedTrials(new Set());
      onOpenChange(false);
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to import trials',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleLink = async () => {
    if (!nctNumber.trim()) {
      toast.error('Error', {
        description: 'Please enter a valid NCT Number',
      });
      return;
    }

    setIsLinking(true);
    try {
      const response = await fetch('/api/trials/link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nctNumber }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to link trial');
      }

      const data = await response.json();
      onLinkSuccess(data.trial);
      
      toast.success('Success', {
        description: 'Trial linked successfully',
      });
      
      // Reset form
      setNctNumber('');
      onOpenChange(false);
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to link trial',
      });
    } finally {
      setIsLinking(false);
    }
  };

  const allSelected = searchResults.length > 0 && selectedTrials.size === searchResults.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import or Link Trials</DialogTitle>
          <DialogDescription>
            Import new trials from ClinicalTrials.gov or link existing trials to your profile
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import">Import New Trials</TabsTrigger>
            <TabsTrigger value="link">Link Existing Trial</TabsTrigger>
          </TabsList>
          
          <TabsContent value="import" className="space-y-6 mt-4">
            {/* Search Form */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="searchMethod">Search Method</Label>
                  <Select value={searchMethod} onValueChange={(value: 'pi' | 'institution') => setSearchMethod(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pi">Principal Investigator</SelectItem>
                      <SelectItem value="institution">Institution</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxResults">Max Results</Label>
                  <Select value={maxResults} onValueChange={setMaxResults}>
                    <SelectTrigger>
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
              
              <div className="space-y-2">
                <Label htmlFor="searchTerm">
                  {searchMethod === 'pi' ? 'Principal Investigator Name' : 'Institution Name'}
                </Label>
                <div className="flex space-x-2">
                  <Input
                    id="searchTerm"
                    placeholder={searchMethod === 'pi' ? 'Enter PI name' : 'Enter institution name'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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
            
            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Search Results ({searchResults.length})</h3>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="selectAll"
                      checked={allSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="selectAll" className="text-sm">
                      Select All
                    </Label>
                  </div>
                </div>
                
                <div className="border rounded-md max-h-96 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-muted sticky top-0">
                      <tr>
                        <th className="text-left p-3 w-12"></th>
                        <th className="text-left p-3">Title</th>
                        <th className="text-left p-3 w-32">NCT Number</th>
                        <th className="text-left p-3 w-24">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.map((trial) => (
                        <tr key={trial.nctNumber} className="border-b hover:bg-muted/50">
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={selectedTrials.has(trial.nctNumber)}
                              onChange={(e) => handleSelectTrial(trial.nctNumber, e.target.checked)}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                          </td>
                          <td className="p-3">
                            <div className="font-medium text-sm line-clamp-2">{trial.title}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {trial.conditions.slice(0, 2).join(', ')}
                            </div>
                          </td>
                          <td className="p-3 text-sm font-mono">
                            {trial.nctNumber}
                          </td>
                          <td className="p-3">
                            <span className="text-xs px-2 py-1 rounded-full bg-secondary">
                              {trial.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Selected: {selectedTrials.size} of {searchResults.length} trials
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="link" className="space-y-6 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nctNumber">NCT Number</Label>
                <div className="flex space-x-2">
                  <Input
                    id="nctNumber"
                    placeholder="Enter NCT Number (e.g., NCT00000419)"
                    value={nctNumber}
                    onChange={(e) => setNctNumber(e.target.value)}
                  />
                  <Button onClick={handleLink} disabled={isLinking}>
                    {isLinking ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <LinkIcon className="mr-2 h-4 w-4" />
                    )}
                    Link
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter the NCT Number of an existing trial on ClinicalTrials.gov to link it to your profile
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {activeTab === 'import' && (
            <Button 
              onClick={handleImport} 
              disabled={selectedTrials.size === 0 || isImporting}
            >
              {isImporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                `Import ${selectedTrials.size} Trial${selectedTrials.size !== 1 ? 's' : ''}`
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}