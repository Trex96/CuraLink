'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClinicalTrial } from '@/types';
import { toast } from 'sonner';
import { Loader2, Search, CheckCircle } from 'lucide-react';

interface TrialImportWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess: (trials: ClinicalTrial[]) => void;
}

export function TrialImportWizard({ open, onOpenChange, onImportSuccess }: TrialImportWizardProps) {
  const [step, setStep] = useState(1);
  const [searchMethod, setSearchMethod] = useState<'pi' | 'institution'>('pi');
  const [searchTerm, setSearchTerm] = useState('');
  const [maxResults, setMaxResults] = useState('20');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ClinicalTrial[]>([]);
  const [selectedTrials, setSelectedTrials] = useState<Set<string>>(new Set());
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  const totalSteps = 3;

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
      setStep(2);
      
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
    setImportProgress(0);
    setStep(3);
    
    try {
      const trialsToImport = searchResults.filter(trial => selectedTrials.has(trial.nctNumber));
      
      // Make the actual API call to import trials
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
      
      // Update progress to 100%
      setImportProgress(100);
      
      // Call the success callback with the imported trials
      onImportSuccess(data.trials);
      
      toast.success('Success', {
        description: `Imported ${data.trials.length} trials successfully`,
      });
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to import trials',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const resetWizard = () => {
    setStep(1);
    setSearchMethod('pi');
    setSearchTerm('');
    setMaxResults('20');
    setSearchResults([]);
    setSelectedTrials(new Set());
    setIsSearching(false);
    setIsImporting(false);
    setImportProgress(0);
  };

  const allSelected = searchResults.length > 0 && selectedTrials.size === searchResults.length;

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) {
        resetWizard();
      }
    }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Trial Import Wizard</DialogTitle>
          <DialogDescription>
            Step {step} of {totalSteps}: {step === 1 ? 'Search for trials' : step === 2 ? 'Select trials' : 'Import progress'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${(step / totalSteps) * 100}%` }}
            ></div>
          </div>
          
          {step === 1 && (
            <div className="space-y-6">
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
              
              <div className="text-sm text-muted-foreground">
                <p>Enter search criteria to find clinical trials on ClinicalTrials.gov.</p>
                <p className="mt-1">You can search by Principal Investigator name or Institution name.</p>
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Select Trials to Import ({searchResults.length} found)</h3>
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
            </div>
          )}
          
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center py-8">
                {isImporting ? (
                  <>
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                    <h3 className="mt-4 text-lg font-medium">Importing Trials</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Please wait while we import your selected trials...
                    </p>
                    <div className="w-full bg-secondary rounded-full h-2 mt-4">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${importProgress}%` }}
                      ></div>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {Math.round(importProgress)}% complete
                    </p>
                  </>
                ) : (
                  <>
                    <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                    <h3 className="mt-4 text-lg font-medium">Import Complete!</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Successfully imported {selectedTrials.size} trials.
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          {step === 1 && (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          )}
          
          {step === 2 && (
            <>
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
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
            </>
          )}
          
          {step === 3 && !isImporting && (
            <Button onClick={() => onOpenChange(false)}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}