'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Plus } from 'lucide-react';
import { toast } from "sonner";

interface ImportTrialsDialogProps {
    onImportSuccess: () => void;
}

interface TrialImportData {
    nctNumber: string;
    title: string;
    status: string;
    phase: string;
}

export function ImportTrialsDialog({ onImportSuccess }: ImportTrialsDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [nctNumber, setNctNumber] = useState('');
    const [searchResults, setSearchResults] = useState<TrialImportData[]>([]);
    const [importingId, setImportingId] = useState<string | null>(null);

    const handleSearch = async (method: 'pi' | 'institution') => {
        if (!searchTerm) return;

        setLoading(true);
        try {
            const response = await fetch('/api/trials/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    searchMethod: method,
                    searchTerm,
                    maxResults: 10
                })
            });

            const data = await response.json();
            if (data.trials) {
                setSearchResults(data.trials);
            } else {
                setSearchResults([]);
                toast.error('No trials found', {
                    description: 'Try a different search term.',
                });
            }
        } catch (error) {
            console.error('Search error:', error);
            toast.error('Error searching trials', {
                description: 'Something went wrong. Please try again.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async (trial: TrialImportData) => {
        setImportingId(trial.nctNumber);
        try {
            const response = await fetch('/api/trials/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    trials: [trial]
                })
            });

            if (response.ok) {
                toast.success('Trial imported', {
                    description: `${trial.nctNumber} has been imported successfully.`
                });
                // Link it to the researcher as well? The import endpoint handles creation, 
                // but we need to ensure it's linked. 
                // My implementation of /api/trials/import handles creation but NOT linking to the user explicitly 
                // unless I modify it or call /link separately.
                // Wait, the requirement was "Import trials... Link existing trials".
                // Let's call the link endpoint after import to be safe, or update import to link.
                // For now, I'll call the link endpoint immediately after.

                await fetch('/api/trials/link', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nctNumber: trial.nctNumber })
                });

                onImportSuccess();
            } else {
                throw new Error('Import failed');
            }
        } catch {
            toast.error('Import failed', {
                description: 'Could not import the trial.',
            });
        } finally {
            setImportingId(null);
        }
    };

    const handleLinkByNct = async () => {
        if (!nctNumber) return;

        setLoading(true);
        try {
            const response = await fetch('/api/trials/link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nctNumber })
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Trial linked', {
                    description: `${nctNumber} has been linked to your profile.`
                });
                onImportSuccess();
                setOpen(false);
            } else {
                toast.error('Link failed', {
                    description: data.error || 'Could not link the trial.',
                });
            }
        } catch {
            toast.error('Error', {
                description: 'Something went wrong.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Import / Link Trials
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Manage Clinical Trials</DialogTitle>
                    <DialogDescription>
                        Import trials from ClinicalTrials.gov or link existing ones to your profile.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="search" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="search">Search & Import</TabsTrigger>
                        <TabsTrigger value="link">Link by NCT ID</TabsTrigger>
                    </TabsList>

                    <TabsContent value="search" className="space-y-4 py-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Search by PI Name or Institution..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => handleSearch('pi')}
                                disabled={loading || !searchTerm}
                            >
                                Search by PI
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => handleSearch('institution')}
                                disabled={loading || !searchTerm}
                            >
                                Search by Institution
                            </Button>
                        </div>

                        {loading && (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        )}

                        {!loading && searchResults.length > 0 && (
                            <div className="space-y-4 mt-4">
                                <h4 className="text-sm font-medium text-muted-foreground">Found {searchResults.length} trials</h4>
                                {searchResults.map((trial) => (
                                    <div key={trial.nctNumber} className="border rounded-lg p-4 flex justify-between items-start gap-4">
                                        <div>
                                            <div className="font-medium">{trial.nctNumber}</div>
                                            <div className="text-sm line-clamp-2 mt-1">{trial.title}</div>
                                            <div className="text-xs text-muted-foreground mt-2">
                                                {trial.status} • {trial.phase}
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => handleImport(trial)}
                                            disabled={importingId === trial.nctNumber}
                                        >
                                            {importingId === trial.nctNumber ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                'Import'
                                            )}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="link" className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="nct-id">NCT Number</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="nct-id"
                                    placeholder="e.g. NCT01234567"
                                    value={nctNumber}
                                    onChange={(e) => setNctNumber(e.target.value)}
                                />
                                <Button onClick={handleLinkByNct} disabled={loading || !nctNumber}>
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Link'}
                                </Button>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Enter the ClinicalTrials.gov identifier (NCT Number) to link an existing trial.
                            </p>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
