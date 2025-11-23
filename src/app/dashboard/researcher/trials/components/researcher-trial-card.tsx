'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClinicalTrial } from '@/types';
import { ExternalLink, Edit, Calendar, MapPin } from 'lucide-react';
import { TrialDetailsEditor } from './trial-details-editor';

interface ResearcherTrialCardProps {
  trial: ClinicalTrial & { researcherRole?: string };
  onUpdate: (nctNumber: string, updates: Partial<ClinicalTrial> & { researcherRole?: string }) => void;
}

export function ResearcherTrialCard({ trial, onUpdate }: ResearcherTrialCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  const getStatusBadge = () => {
    switch (trial.status) {
      case 'Recruiting':
        return <Badge variant="default">Recruiting</Badge>;
      case 'Active, not recruiting':
        return <Badge variant="secondary">Active</Badge>;
      case 'Completed':
        return <Badge variant="outline">Completed</Badge>;
      case 'Suspended':
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return <Badge variant="secondary">{trial.status}</Badge>;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg leading-tight">{trial.title}</CardTitle>
          <CardDescription className="flex items-center gap-2">
            <span className="font-mono">{trial.nctNumber}</span>
            {getStatusBadge()}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{trial.phase}</Badge>
              {trial.researcherRole && (
                <Badge variant="outline">{trial.researcherRole}</Badge>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-3">
              {trial.summary}
            </p>
            
            <div className="text-xs text-muted-foreground">
              <div className="flex items-center mt-1">
                <Calendar className="mr-1 h-3 w-3" />
                Last updated: {new Date(trial.lastUpdated).toLocaleDateString()}
              </div>
              {trial.locations.length > 0 && (
                <div className="flex items-center mt-1">
                  <MapPin className="mr-1 h-3 w-3" />
                  {trial.locations.length} location{trial.locations.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
            
            {trial.conditions.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {trial.conditions.slice(0, 3).map((condition, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {condition}
                  </Badge>
                ))}
                {trial.conditions.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{trial.conditions.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button variant="outline" size="sm" asChild>
            <a href={`https://clinicaltrials.gov/ct2/show/${trial.nctNumber}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-1 h-3 w-3" />
              View on ClinicalTrials.gov
            </a>
          </Button>
          
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Edit className="mr-1 h-3 w-3" />
            Edit
          </Button>
        </CardFooter>
      </Card>
      
      <TrialDetailsEditor
        open={isEditing}
        onOpenChange={setIsEditing}
        trial={trial}
        onUpdate={onUpdate}
      />
    </>
  );
}
