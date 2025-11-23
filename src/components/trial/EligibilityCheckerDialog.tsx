'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ClinicalTrial } from '@/types';
import { toast } from 'sonner';

interface EligibilityCheckerDialogProps {
  trial: ClinicalTrial;
  onEligibilityCheck?: (result: {
    isEligible: boolean;
    matchPercentage: number;
    matchedCriteria: string[];
    unmatchedCriteria: string[];
  }) => void;
}

export function EligibilityCheckerDialog({ trial, onEligibilityCheck }: EligibilityCheckerDialogProps) {
  const [open, setOpen] = useState(false);
  const [eligibilityAnswers, setEligibilityAnswers] = useState<Record<string, boolean>>({});
  const [checking, setChecking] = useState(false);

  const handleEligibilityChange = (criteria: string, checked: boolean) => {
    setEligibilityAnswers(prev => ({
      ...prev,
      [criteria]: checked
    }));
  };

  const handleCheckEligibility = async () => {
    setChecking(true);
    
    try {
      const res = await fetch('/api/trials/check-eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          trialId: trial._id,
          userAnswers: eligibilityAnswers
        })
      });
      
      if (!res.ok) throw new Error('Failed to check eligibility');
      
      const result = await res.json();
      
      // Call the callback if provided
      onEligibilityCheck?.(result);
      
      // Show toast with result
      toast.success(
        result.isEligible 
          ? 'You may be eligible for this trial!' 
          : 'You may not be eligible for this trial'
      );
    } catch (err) {
      toast.error('Failed to check eligibility');
      console.error(err);
    } finally {
      setChecking(false);
    }
  };

  const handleReset = () => {
    setEligibilityAnswers({});
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Check Eligibility</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Eligibility Checker</DialogTitle>
          <DialogDescription>
            Answer the following questions to check if you meet the criteria for this trial
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {trial.eligibilityCriteria && trial.eligibilityCriteria.length > 0 ? (
            <div className="space-y-4">
              <div className="space-y-3">
                {trial.eligibilityCriteria.map((criteria, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Checkbox
                      id={`criteria-${index}`}
                      checked={eligibilityAnswers[criteria] || false}
                      onCheckedChange={(checked) => handleEligibilityChange(criteria, !!checked)}
                    />
                    <label
                      htmlFor={`criteria-${index}`}
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {criteria}
                    </label>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleCheckEligibility}
                  disabled={checking || Object.keys(eligibilityAnswers).length === 0}
                >
                  {checking ? 'Checking...' : 'Check My Eligibility'}
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  Reset
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No eligibility criteria specified for this trial</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}