'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, ExternalLink, MapPin, Users } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface Trial {
    _id: string;
    nctNumber: string;
    title: string;
    status: string;
    phase: string;
    conditions: string[];
    lastUpdated: string;
    locations: Array<{ address?: string }>;
    enrollment?: number;
}

interface ResearcherTrialCardProps {
    trial: Trial;
    onEdit: (trial: Trial) => void;
}

export function ResearcherTrialCard({ trial, onEdit }: ResearcherTrialCardProps) {
    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start gap-4">
                    <div>
                        <Badge variant="outline" className="mb-2">{trial.nctNumber}</Badge>
                        <CardTitle className="text-lg line-clamp-2" title={trial.title}>
                            {trial.title}
                        </CardTitle>
                    </div>
                    <Badge variant={trial.status === 'Recruiting' ? 'default' : 'secondary'}>
                        {trial.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="flex-1">
                <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">Phase:</span> {trial.phase}
                    </div>

                    {trial.enrollment && (
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>Target Enrollment: {trial.enrollment}</span>
                        </div>
                    )}

                    {trial.locations && trial.locations.length > 0 && (
                        <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 mt-0.5" />
                            <span className="line-clamp-1">{trial.locations.length} Locations</span>
                        </div>
                    )}

                    <div>
                        <span className="font-medium text-foreground">Conditions:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {trial.conditions.slice(0, 3).map((condition, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                    {condition}
                                </Badge>
                            ))}
                            {trial.conditions.length > 3 && (
                                <Badge variant="secondary" className="text-xs">+{trial.conditions.length - 3}</Badge>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-between">
                <div className="text-xs text-muted-foreground">
                    Updated: {format(new Date(trial.lastUpdated), 'MMM d, yyyy')}
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild disabled={!trial.nctNumber}>
                        {trial.nctNumber ? (
                            <Link href={`https://clinicaltrials.gov/study/${trial.nctNumber}`} target="_blank">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View
                            </Link>
                        ) : (
                            <span>
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View
                            </span>
                        )}
                    </Button>
                    <Button size="sm" onClick={() => onEdit(trial)}>
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
