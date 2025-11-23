'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MapPin, Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface Researcher {
  id: string;
  name: string;
  institution: string;
  expertise?: string[];
  location?: string;
  avatar?: string;
  matchPercentage?: number;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

interface ResearcherCardProps {
  researcher: Researcher;
  variant?: 'compact' | 'full';
  onClick?: () => void;
}

export function ResearcherCard({
  researcher,
  variant = 'compact',
  onClick
}: ResearcherCardProps) {
  const {
    id,
    name,
    institution,
    expertise = [],
    location,
    avatar,
    matchPercentage,
    isFavorite,
    onToggleFavorite
  } = researcher;

  if (variant === 'compact') {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        className="cursor-pointer"
        onClick={onClick}
      >
        <Card className="h-full">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={avatar} alt={name} />
                  <AvatarFallback>{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">{name}</CardTitle>
                  <CardDescription className="text-sm">{institution}</CardDescription>
                </div>
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
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1 mb-2">
              {expertise.slice(0, 3).map((item, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {item}
                </Badge>
              ))}
              {expertise.length > 3 && (
                <Badge variant="secondary" className="text-xs">+{expertise.length - 3}</Badge>
              )}
            </div>
            {location && (
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-3 w-3 mr-1" />
                {location}
              </div>
            )}
          </CardContent>
          {matchPercentage && (
            <CardFooter className="pt-2">
              <div className="flex items-center justify-between w-full">
                <span className="text-sm font-medium">Match: {matchPercentage}%</span>
                <Badge variant={matchPercentage > 80 ? "default" : matchPercentage > 50 ? "secondary" : "outline"}>
                  {matchPercentage > 80 ? "High" : matchPercentage > 50 ? "Medium" : "Low"}
                </Badge>
              </div>
            </CardFooter>
          )}
        </Card>
      </motion.div>
    );
  }

  // Full variant
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={avatar} alt={name} />
                <AvatarFallback className="text-lg">{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl">{name}</CardTitle>
                <CardDescription>{institution}</CardDescription>
                {location && (
                  <div className="flex items-center mt-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    {location}
                  </div>
                )}
              </div>
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
                <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {expertise.map((item, index) => (
                  <Badge key={index} variant="default">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
            {matchPercentage && (
              <div>
                <h3 className="font-medium mb-2">Match Score</h3>
                <div className="flex items-center">
                  <div className="w-full bg-secondary rounded-full h-2.5">
                    <div
                      className="bg-primary h-2.5 rounded-full"
                      style={{ width: `${matchPercentage}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm font-medium">{matchPercentage}%</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">
            <Users className="h-4 w-4 mr-2" />
            Connect
          </Button>
          <Button>View Profile</Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}