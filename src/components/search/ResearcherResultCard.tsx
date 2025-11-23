'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MatchBadge } from '@/components/ui/match-badge';
import { LocationDisplay } from '@/components/ui/location-display';
import { DistanceDisplay } from '@/components/distance-display';
import { User, Mail, MapPin, UserPlus, Clock, MessageSquare, Check } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface ResearcherResult {
  id: string;
  _id?: string; // Handle both id and _id
  firstName: string;
  lastName: string;
  institution: string;
  bio: string;
  expertise?: string[];
  location?: {
    coordinates: [number, number];
    address?: string;
  };
  distance?: number;
  matchPercentage: number;
  email?: string;
  profilePicture?: string;
  connectionStatus?: 'none' | 'pending_sent' | 'pending_received' | 'connected' | 'declined';
  connectionId?: string;
  conditions?: string[];
  role?: string;
}

interface ResearcherResultCardProps {
  researcher: ResearcherResult;
  onConnect?: (id: string) => void;
  isOwnProfile?: boolean;
}

export function ResearcherResultCard({ researcher, onConnect, isOwnProfile }: ResearcherResultCardProps) {
  const getInitials = (first: string, last: string) => {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  };

  const id = researcher.id || researcher._id || '';

  const tags = researcher.expertise || researcher.conditions || [];

  return (
    <Card className="hover:shadow-md transition-shadow mb-4">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Avatar Section */}
          <div className="flex-shrink-0">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-2 border-muted">
              <AvatarImage src={researcher.profilePicture} alt={researcher.firstName} />
              <AvatarFallback className="text-lg bg-primary/10 text-primary">
                {getInitials(researcher.firstName, researcher.lastName)}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Info Section */}
          <div className="flex-grow min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
              <div>
                <h3 className="text-lg font-semibold hover:underline cursor-pointer flex items-center gap-2">
                  {researcher.firstName} {researcher.lastName}
                  <MatchBadge percentage={researcher.matchPercentage} />
                </h3>
                <p className="text-sm font-medium text-foreground/80 mt-1">
                  {researcher.institution || (researcher.role === 'patient' ? 'Patient' : 'Researcher')}
                </p>
                {researcher.location && (
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <MapPin className="mr-1 h-3 w-3" />
                    <LocationDisplay
                      coordinates={researcher.location.coordinates}
                      address={researcher.location.address}
                    />
                    {researcher.distance !== undefined && (
                      <span className="ml-1">
                        • <DistanceDisplay distanceKm={researcher.distance} unit="mi" precision={1} /> away
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="flex-shrink-0 mt-2 sm:mt-0">
                {isOwnProfile ? (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={researcher.role === 'patient' ? '/dashboard/patient/profile' : '/dashboard/researcher/profile'}>
                      <User className="mr-2 h-4 w-4" /> View Profile
                    </Link>
                  </Button>
                ) : researcher.connectionStatus === 'connected' ? (
                  <Button variant="outline" size="sm" onClick={() => toast.info('Messaging feature coming soon!')}>
                    <MessageSquare className="mr-2 h-4 w-4" /> Message
                  </Button>
                ) : researcher.connectionStatus === 'pending_sent' ? (
                  <Button variant="secondary" size="sm" disabled>
                    <Clock className="mr-2 h-4 w-4" /> Pending
                  </Button>
                ) : researcher.connectionStatus === 'pending_received' ? (
                  <Button variant="default" size="sm" onClick={() => window.location.href = '/dashboard/researcher/collaborations'}>
                    <UserPlus className="mr-2 h-4 w-4" /> Respond
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => onConnect?.(id)}>
                    <UserPlus className="mr-2 h-4 w-4" /> Connect
                  </Button>
                )}
              </div>
            </div>

            {/* Bio & Expertise */}
            <div className="mt-3">
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {researcher.bio || (researcher.role === 'patient' ? 'Patient Member' : `Researcher at ${researcher.institution || 'Unknown Institution'}`)}
              </p>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.slice(0, 4).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs font-normal bg-muted text-muted-foreground hover:bg-muted/80">
                      {tag}
                    </Badge>
                  ))}
                  {tags.length > 4 && (
                    <span className="text-xs text-muted-foreground self-center">
                      +{tags.length - 4} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}