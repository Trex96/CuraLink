'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';

const collaborationRequestSchema = z.object({
  researcherId: z.string().min(1, 'Please select a researcher'),
  context: z.string().min(10, 'Context must be at least 10 characters').max(500, 'Context must be less than 500 characters'),
});

type CollaborationRequestFormValues = z.infer<typeof collaborationRequestSchema>;

interface CollaborationData {
  _id: string;
  requesterId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'declined';
  context: string;
  acceptedAt?: string;
  createdAt: string;
  updatedAt: string;
  requesterName: string;
  requesterInstitution: string;
  receiverName: string;
  receiverInstitution: string;
}

interface RequestCollaborationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestSuccess: (collaboration: CollaborationData) => void;
}

export function RequestCollaborationDialog({ 
  open, 
  onOpenChange, 
  onRequestSuccess 
}: RequestCollaborationDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Researcher[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  interface Researcher {
  _id: string;
  firstName: string;
  lastName: string;
  institution: string;
  expertise?: string[];
  // Add other researcher properties as needed
}

const [selectedResearcher, setSelectedResearcher] = useState<Researcher | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CollaborationRequestFormValues>({
    resolver: zodResolver(collaborationRequestSchema),
    defaultValues: {
      researcherId: '',
      context: '',
    },
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(`/api/search/researchers?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error('Failed to search researchers');
      const data = await response.json();
      setSearchResults(data.items || []);
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to search researchers',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResearcher = (researcher: Researcher) => {
    setSelectedResearcher(researcher);
    setSearchResults([]);
    setSearchQuery('');
  };

  const onSubmit = async (data: CollaborationRequestFormValues) => {
    if (!selectedResearcher) {
      toast.error('Error', {
        description: 'Please select a researcher to collaborate with',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/collaborations/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId: selectedResearcher._id,
          context: data.context,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send collaboration request');
      }

      const result = await response.json();
      onRequestSuccess(result.collaboration);
      
      toast.success('Success', {
        description: 'Collaboration request sent successfully',
      });
      
      // Reset form
      reset();
      setSelectedResearcher(null);
      onOpenChange(false);
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to send collaboration request',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request Collaboration</DialogTitle>
          <DialogDescription>
            Send a collaboration request to another researcher
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="researcherSearch">Find Researcher</Label>
              <div className="flex space-x-2">
                <Input
                  id="researcherSearch"
                  placeholder="Search by name or institution..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button type="button" onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="mr-2 h-4 w-4" />
                  )}
                  Search
                </Button>
              </div>
            </div>
            
            {searchResults.length > 0 && (
              <div className="border rounded-md max-h-60 overflow-y-auto">
                <div className="divide-y">
                  {searchResults.map((researcher) => (
                    <div 
                      key={researcher._id} 
                      className="p-3 hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleSelectResearcher(researcher)}
                    >
                      <div className="font-medium">{researcher.firstName} {researcher.lastName}</div>
                      <div className="text-sm text-muted-foreground">{researcher.institution}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {researcher.expertise?.slice(0, 3).join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {selectedResearcher && (
              <div className="border rounded-md p-4 bg-muted/50">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{selectedResearcher.firstName} {selectedResearcher.lastName}</div>
                    <div className="text-sm text-muted-foreground">{selectedResearcher.institution}</div>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedResearcher(null)}
                  >
                    Change
                  </Button>
                </div>
                <input 
                  type="hidden" 
                  {...register('researcherId')} 
                  value={selectedResearcher._id} 
                />
                {errors.researcherId && (
                  <p className="text-sm text-red-500 mt-1">{errors.researcherId.message}</p>
                )}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="context">Collaboration Context *</Label>
              <Textarea
                id="context"
                placeholder="Describe your research interests and how you'd like to collaborate..."
                rows={5}
                {...register('context')}
              />
              <p className="text-xs text-muted-foreground">
                Explain your research interests and proposal for collaboration (10-500 characters)
              </p>
              {errors.context && (
                <p className="text-sm text-red-500">{errors.context.message}</p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting || !selectedResearcher}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Request...
                </>
              ) : (
                'Send Collaboration Request'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}