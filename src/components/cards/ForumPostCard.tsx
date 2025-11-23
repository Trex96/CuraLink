'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Heart, Eye, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
    isResearcher?: boolean;
  };
  category: string;
  tags: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
  views: number;
  likes: number;
  comments: number;
  isBookmarked?: boolean;
  onToggleBookmark?: (id: string) => void;
}

interface ForumPostCardProps {
  post: ForumPost;
  onClick?: () => void;
}

export function ForumPostCard({ post, onClick }: ForumPostCardProps) {
  const {
    id,
    title,
    content,
    author,
    category,
    tags,
    createdAt,
    views,
    likes,
    comments,
    isBookmarked,
    onToggleBookmark
  } = post;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={author.avatar} alt={author.name} />
                <AvatarFallback>{author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center">
                  <CardTitle className="text-base">{author.name}</CardTitle>
                  {author.isResearcher && (
                    <Badge variant="default" className="ml-2 text-xs">
                      Researcher
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs">
                  {new Date(createdAt).toLocaleDateString()}
                </CardDescription>
              </div>
            </div>
            {onToggleBookmark && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBookmark(id);
                }}
                className={isBookmarked ? "text-blue-500 hover:text-blue-600" : ""}
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
              </Button>
            )}
          </div>
          <CardTitle className="text-lg mt-3">{title}</CardTitle>
          <div className="flex items-center justify-between mt-2">
            <Badge variant="outline">{category}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="line-clamp-2 text-sm mb-3">
            {content.replace(/<[^>]*>/g, '')}
          </p>
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 4).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {tags.length > 4 && (
              <Badge variant="secondary" className="text-xs">
                +{tags.length - 4}
              </Badge>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex space-x-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <Eye className="h-4 w-4 mr-1" />
              {views}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Heart className="h-4 w-4 mr-1" />
              {likes}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <MessageCircle className="h-4 w-4 mr-1" />
              {comments}
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/forum/posts/${post.id}`}>
              View Post
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}