'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface Publication {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  publicationDate: Date | string;
  abstract: string;
  doi?: string;
  keywords?: string[];
  citations: number;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

interface PublicationCardProps {
  publication: Publication;
  onClick?: () => void;
}

export function PublicationCard({ publication, onClick }: PublicationCardProps) {
  const {
    id,
    title,
    authors,
    journal,
    publicationDate,
    abstract,
    doi,
    keywords = [],
    citations,
    isFavorite,
    onToggleFavorite
  } = publication;

  const [isExpanded, setIsExpanded] = useState(false);
  const displayAbstract = isExpanded ? abstract : `${abstract.substring(0, 200)}${abstract.length > 200 ? '...' : ''}`;

  // Format the date consistently
  const formattedDate = typeof publicationDate === 'string'
    ? new Date(publicationDate).toLocaleDateString('en-US')
    : publicationDate.toLocaleDateString('en-US');

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
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription className="mt-1">
                {authors.join(', ')}
              </CardDescription>
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
          <div className="flex items-center justify-between mt-2">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">{journal}</span> •{' '}
              {formattedDate}
            </div>
            <div className="flex items-center text-sm">
              <BookOpen className="h-4 w-4 mr-1" />
              {citations} citations
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-3">{displayAbstract}</p>
          {abstract.length > 200 && (
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </Button>
          )}
          <div className="flex flex-wrap gap-1 mt-3">
            {keywords.slice(0, 5).map((keyword, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {keyword}
              </Badge>
            ))}
            {keywords.length > 5 && (
              <Badge variant="secondary" className="text-xs">
                +{keywords.length - 5}
              </Badge>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            {doi && (
              <span>
                DOI: <span className="font-mono">{doi}</span>
              </span>
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}