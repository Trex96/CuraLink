'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { MatchBadge } from '@/components/ui/match-badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ClinicalTrial } from '@/types';

interface EligibilitySectionProps {
  trial: ClinicalTrial;
  onCheckEligibility?: (answers: Record<string, boolean>) => void;
}

export function EligibilitySection({ trial, onCheckEligibility }: EligibilitySectionProps) {
  const [eligibilityAnswers, setEligibilityAnswers] = useState<Record<string, boolean>>({});
  const [showEligibilityResult, setShowEligibilityResult] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState<{
    isEligible: boolean;
    matchPercentage: number;
    matchedCriteria: string[];
    unmatchedCriteria: string[];
  } | null>(null);

  const handleEligibilityChange = (criteria: string, checked: boolean) => {
    setEligibilityAnswers(prev => ({
      ...prev,
      [criteria]: checked
    }));
  };

  const handleCheckEligibility = async () => {
    // In a real implementation, we would call the API
    // For now, we'll simulate a response
    
    // Calculate match percentage based on answers
    const totalCriteria = trial.eligibilityCriteria?.length || 0;
    const matchedCriteria = Object.values(eligibilityAnswers).filter(Boolean).length;
    const matchPercentage = totalCriteria > 0 ? Math.round((matchedCriteria / totalCriteria) * 100) : 0;
    
    const result = {
      isEligible: matchPercentage >= 70, // Consider eligible if 70%+ match
      matchPercentage,
      matchedCriteria: Object.keys(eligibilityAnswers).filter(key => eligibilityAnswers[key]),
      unmatchedCriteria: Object.keys(eligibilityAnswers).filter(key => !eligibilityAnswers[key])
    };
    
    setEligibilityResult(result);
    setShowEligibilityResult(true);
    
    // Call the callback if provided
    onCheckEligibility?.(eligibilityAnswers);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Eligibility Checker</CardTitle>
        <CardDescription>
          Check if you meet the criteria for this clinical trial
        </CardDescription>
      </CardHeader>
      <CardContent>
        {trial.eligibilityCriteria && trial.eligibilityCriteria.length > 0 ? (
          <div className="space-y-4">
            <div className="space-y-3">
              {trial.eligibilityCriteria.map((criteria, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Checkbox
                    id={`criteria-${index}`}
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
            
            <Button 
              onClick={handleCheckEligibility}
              disabled={Object.keys(eligibilityAnswers).length === 0}
              className="w-full"
            >
              Check My Eligibility
            </Button>
          </div>
        ) : (
          <p className="text-muted-foreground">No eligibility criteria specified for this trial</p>
        )}
        
        {/* Eligibility Result Dialog */}
        <Dialog open={showEligibilityResult} onOpenChange={setShowEligibilityResult}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Eligibility Check Result</DialogTitle>
              <DialogDescription>
                Based on your answers, here&apos;s your eligibility assessment
              </DialogDescription>
            </DialogHeader>
            
            {eligibilityResult && (
              <div className="space-y-4">
                <div className="text-center">
                  <MatchBadge percentage={eligibilityResult.matchPercentage} className="text-lg py-2 px-3" />
                  <p className="mt-2 text-lg font-medium">
                    {eligibilityResult.isEligible 
                      ? 'You may be eligible for this trial!' 
                      : 'You may not be eligible for this trial'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {eligibilityResult.matchPercentage}% of criteria matched
                  </p>
                </div>
                
                {eligibilityResult.matchedCriteria.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Matched Criteria</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {eligibilityResult.matchedCriteria.map((criteria, index) => (
                        <li key={index} className="text-green-600">{criteria}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {eligibilityResult.unmatchedCriteria.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Unmatched Criteria</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {eligibilityResult.unmatchedCriteria.map((criteria, index) => (
                        <li key={index} className="text-red-600">{criteria}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="pt-4">
                  <p className="text-sm text-muted-foreground">
                    This is an initial assessment. Please consult with the research team for a complete evaluation.
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}