'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, ThumbsUp } from 'lucide-react';

import useRelativeTime from '@/hooks/useRelativeTime';
import { useRouter } from 'next/navigation';

interface ForumPostCardProps {
  post: {
    _id: string;
    title: string;
    content: string;
    category: string;
    tags: string[];
    upvotes: string[];
    authorId: {
      firstName: string;
      lastName: string;
      role: string;
    };
    createdAt: string;
    replyCount?: number;
    commentCount?: number;
    isResearcherVerified?: boolean;
  };
  searchQuery?: string;
}

function HighlightText({ text, query, isHtml = false }: { text: string; query?: string; isHtml?: boolean }) {
  if (!query || !text) {
    if (isHtml) return <div className="text-muted-foreground forum-content line-clamp-3" dangerouslySetInnerHTML={{ __html: text }} />;
    return <>{text}</>;
  }

  // Escape special regex characters
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));

  if (isHtml) {
    // For HTML content, we need a more complex approach or just strip tags for preview
    // Simple approach: Strip tags for preview and highlight
    const plainText = text.replace(/<[^>]+>/g, ' ');
    const plainParts = plainText.split(new RegExp(`(${escapedQuery})`, 'gi'));

    return (
      <div className="text-muted-foreground forum-content line-clamp-3">
        {plainParts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <span key={i} className="bg-yellow-200 dark:bg-yellow-900/50 font-medium text-foreground px-0.5 rounded">{part}</span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </div>
    );
  }

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={i} className="bg-yellow-200 dark:bg-yellow-900/50 font-medium text-foreground px-0.5 rounded">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export function ForumPostCard({ post, searchQuery }: ForumPostCardProps) {
  const router = useRouter();
  const relativeTime = useRelativeTime(post.createdAt);

  const handleClick = () => {
    router.push(`/forum/posts/${post._id}`);
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleClick}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">
            <HighlightText text={post.title} query={searchQuery} />
          </CardTitle>
          {post.isResearcherVerified && (
            <Badge variant="secondary">Verified</Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{post.authorId.firstName} {post.authorId.lastName}</span>
          {post.authorId.role === 'researcher' && (
            <Badge variant="outline">Researcher</Badge>
          )}
          <span>•</span>
          <span>{relativeTime}</span>
        </div>
      </CardHeader>
      <CardContent>
        <HighlightText text={post.content} query={searchQuery} isHtml={true} />
        <div className="flex flex-wrap gap-2 mt-3">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <ThumbsUp className="h-4 w-4" />
            <span className="text-sm">{post.upvotes.length}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm">{post.commentCount ?? post.replyCount ?? 0}</span>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}>
          View
        </Button>
      </CardFooter>
    </Card>
  );
}