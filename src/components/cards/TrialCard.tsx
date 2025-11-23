'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, FlaskConical, Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface Trial {
  id: string;
  title: string;
  description: string;
  status: 'recruiting' | 'active' | 'completed' | 'suspended' | 'terminated';
  phase: string;
  condition: string;
  location: string;
  eligibility?: string[];
  startDate?: Date | string;
  endDate?: Date | string;
  participantsNeeded: number;
  participantsEnrolled: number;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

interface TrialCardProps {
  trial: Trial;
  onClick?: () => void;
}

const statusColors = {
  recruiting: 'bg-green-100 text-green-800',
  active: 'bg-blue-100 text-blue-800',
  completed: 'bg-gray-100 text-gray-800',
  suspended: 'bg-yellow-100 text-yellow-800',
  terminated: 'bg-red-100 text-red-800',
};

const statusLabels = {
  recruiting: 'Recruiting',
  active: 'Active',
  completed: 'Completed',
  suspended: 'Suspended',
  terminated: 'Terminated',
};

export function TrialCard({ trial, onClick }: TrialCardProps) {
  const {
    id,
    title,
    description,
    status,
    phase,
    condition,
    location,
    eligibility = [],
    startDate,
    endDate,
    participantsNeeded,
    participantsEnrolled,
    isFavorite,
    onToggleFavorite
  } = trial;

  const progress = participantsNeeded > 0
    ? Math.min(100, Math.round((participantsEnrolled / participantsNeeded) * 100))
    : 0;

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'TBD';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FlaskConical className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-lg">{title}</CardTitle>
              </div>
              <CardDescription className="line-clamp-2">{description}</CardDescription>
            </div>
            {onToggleFavorite && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(id);
                }}
                className={isFavorite ? "text-red-500 hover:text-red-600" : ""}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge className={statusColors[status]}>{statusLabels[status]}</Badge>
            <Badge variant="outline">{phase}</Badge>
            <Badge variant="secondary">{condition}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              {location}
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Enrollment Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{participantsEnrolled} enrolled</span>
                <span>{participantsNeeded} needed</span>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm mb-1">Key Eligibility Criteria</h4>
              <ul className="text-xs space-y-1">
                {eligibility.slice(0, 3).map((criterion, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span className="line-clamp-1">{criterion}</span>
                  </li>
                ))}
                {eligibility.length > 3 && (
                  <li className="text-muted-foreground">+{eligibility.length - 3} more criteria</li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Starts: {formatDate(startDate)}
            {endDate && ` • Ends: ${formatDate(endDate)}`}
          </div>
          <Button asChild>
            <Link href={`/trials/${(trial as any).nctNumber || trial.id}`}>
              <Users className="h-4 w-4 mr-2" />
              View Details
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}