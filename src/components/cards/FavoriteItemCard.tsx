'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { X, Heart, BookOpen, FlaskConical, Users } from 'lucide-react';

interface FavoriteItem {
  id: string;
  type: 'researcher' | 'publication' | 'trial' | 'forum-post';
  title: string;
  description: string;
  avatar?: string;
  metadata?: {
    institution?: string;
    journal?: string;
    status?: string;
    category?: string;
    date?: Date;
  };
  onRemove: (id: string) => void;
}

interface FavoriteItemCardProps {
  item: FavoriteItem;
  onClick?: () => void;
}

const typeIcons = {
  researcher: <Users className="h-4 w-4" />,
  publication: <BookOpen className="h-4 w-4" />,
  trial: <FlaskConical className="h-4 w-4" />,
  'forum-post': <Users className="h-4 w-4" />,
};

const typeLabels = {
  researcher: 'Researcher',
  publication: 'Publication',
  trial: 'Trial',
  'forum-post': 'Forum Post',
};

export function FavoriteItemCard({ item, onClick }: FavoriteItemCardProps) {
  const {
    id,
    type,
    title,
    description,
    avatar,
    metadata,
    onRemove
  } = item;

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
                <AvatarImage src={avatar} alt={title} />
                <AvatarFallback>{title.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center">
                  <CardTitle className="text-base">{title}</CardTitle>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {typeLabels[type]}
                  </span>
                </div>
                <CardDescription className="text-sm line-clamp-1">
                  {description}
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(id);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-xs text-muted-foreground">
            {typeIcons[type]}
            <span className="ml-1">
              {metadata?.institution || metadata?.journal || metadata?.category || 'N/A'}
            </span>
            {metadata?.date && (
              <>
                <span className="mx-2">•</span>
                <span>{metadata.date.toLocaleDateString()}</span>
              </>
            )}
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <Button variant="outline" size="sm" className="w-full">
            <Heart className="h-4 w-4 mr-2 fill-current text-red-500" />
            Favorited
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}