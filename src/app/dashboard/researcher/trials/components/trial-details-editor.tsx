'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClinicalTrial } from '@/types';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface TrialDetailsEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trial: ClinicalTrial & { researcherRole?: string };
  onUpdate: (nctNumber: string, updates: Partial<ClinicalTrial> & { researcherRole?: string }) => void;
}

export function TrialDetailsEditor({ open, onOpenChange, trial, onUpdate }: TrialDetailsEditorProps) {
  const [editedTrial, setEditedTrial] = useState(trial);
  const [role, setRole] = useState(trial.researcherRole || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field: keyof ClinicalTrial, value: string | string[] | Date) => {
    setEditedTrial(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate(trial.nctNumber, { 
        ...editedTrial,
        researcherRole: role
      });
      
      toast.success('Success', {
        description: 'Trial updated successfully',
      });
      
      onOpenChange(false);
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to update trial',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Trial Details</DialogTitle>
          <DialogDescription>
            Update information for trial {trial.nctNumber}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editedTrial.title}
                onChange={(e) => handleChange('title', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nctNumber">NCT Number</Label>
              <Input
                id="nctNumber"
                value={editedTrial.nctNumber}
                onChange={(e) => handleChange('nctNumber', e.target.value)}
                disabled
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phase">Phase</Label>
              <Select 
                value={editedTrial.phase} 
                onValueChange={(value) => handleChange('phase', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Phase 1">Phase 1</SelectItem>
                  <SelectItem value="Phase 2">Phase 2</SelectItem>
                  <SelectItem value="Phase 3">Phase 3</SelectItem>
                  <SelectItem value="Phase 4">Phase 4</SelectItem>
                  <SelectItem value="Not Applicable">Not Applicable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={editedTrial.status} 
                onValueChange={(value) => handleChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Recruiting">Recruiting</SelectItem>
                  <SelectItem value="Active, not recruiting">Active, not recruiting</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                  <SelectItem value="Terminated">Terminated</SelectItem>
                  <SelectItem value="Withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Your Role in This Trial</Label>
            <Input
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g., Principal Investigator, Co-Investigator"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              value={editedTrial.summary}
              onChange={(e) => handleChange('summary', e.target.value)}
              rows={4}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="conditions">Conditions (comma separated)</Label>
            <Input
              id="conditions"
              value={editedTrial.conditions.join(', ')}
              onChange={(e) => handleChange('conditions', e.target.value.split(',').map(c => c.trim()))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="interventions">Interventions (comma separated)</Label>
            <Input
              id="interventions"
              value={editedTrial.interventions.join(', ')}
              onChange={(e) => handleChange('interventions', e.target.value.split(',').map(i => i.trim()))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contactInfo">Contact Information</Label>
            <Textarea
              id="contactInfo"
              value={editedTrial.contactInfo}
              onChange={(e) => handleChange('contactInfo', e.target.value)}
              rows={2}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}