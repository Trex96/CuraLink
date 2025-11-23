'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, HeartOff, Send } from 'lucide-react';
import { Researcher } from './types';

interface ResearcherHeaderProps {
  researcher: Researcher;
  isFavorite: boolean;
  onFavoriteToggle: () => void;
  onRequestExpert: () => void;
}

export function ResearcherHeader({ 
  researcher, 
  isFavorite, 
  onFavoriteToggle, 
  onRequestExpert 
}: ResearcherHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
      <Avatar className="h-20 w-20">
        {researcher.profilePicture ? (
          <AvatarImage src={researcher.profilePicture} alt={`${researcher.firstName} ${researcher.lastName}`} />
        ) : (
          <AvatarFallback>
            {researcher.firstName.charAt(0)}
            {researcher.lastName.charAt(0)}
          </AvatarFallback>
        )}
      </Avatar>
      
      <div className="flex-1">
        <h1 className="text-2xl font-bold">
          {researcher.firstName} {researcher.lastName}
        </h1>
        <p className="text-lg text-muted-foreground">{researcher.institution}</p>
        {researcher.orcidId && (
          <a 
            href={`https://orcid.org/${researcher.orcidId}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-indigo-600 hover:underline"
          >
            ORCID: {researcher.orcidId}
          </a>
        )}
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant={isFavorite ? "default" : "outline"} 
          onClick={onFavoriteToggle}
        >
          {isFavorite ? (
            <>
              <HeartOff className="mr-2 h-4 w-4" />
              Favorited
            </>
          ) : (
            <>
              <Heart className="mr-2 h-4 w-4" />
              Save
            </>
          )}
        </Button>
        
        <Button onClick={onRequestExpert}>
          <Send className="mr-2 h-4 w-4" />
          Request Expert
        </Button>
      </div>
    </div>
  );
}