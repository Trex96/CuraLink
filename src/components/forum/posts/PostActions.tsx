'use client';

import { Button } from '@/components/ui/button';
import { 
  ThumbsUp, 
  MessageCircle, 
  Share2, 
  Bookmark
} from 'lucide-react';

interface PostActionsProps {
  postId: string;
  upvotes: string[];
  replyCount?: number;
  commentCount?: number;
  currentUser: {
    id: string;
    role: string;
  } | null;
  onUpvote: (postId: string) => void;
  onShare: (postId: string) => void;
  onFollow: (postId: string) => void;
}

export function PostActions({ 
  postId,
  upvotes,
  replyCount,
  commentCount,
  currentUser,
  onUpvote,
  onShare,
  onFollow
}: PostActionsProps) {
  const hasUpvoted = currentUser && upvotes.includes(currentUser.id);
  const comments = (commentCount ?? replyCount ?? 0);
  
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-4">
        <Button 
          variant={hasUpvoted ? 'secondary' : 'ghost'} 
          size="sm" 
          className={`flex items-center gap-2 ${hasUpvoted ? 'text-blue-600' : ''}`}
          onClick={() => onUpvote(postId)}
        >
          <ThumbsUp className={`h-4 w-4 ${hasUpvoted ? 'fill-current' : ''}`} />
          <span>{hasUpvoted ? 'Unlike' : 'Like'}</span>
          <span>{upvotes.length}</span>
        </Button>
        <div className="flex items-center gap-1 text-muted-foreground">
          <MessageCircle className="h-4 w-4" />
          <span>{comments} comments</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onShare(postId)}
        >
          <Share2 className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onFollow(postId)}
        >
          <Bookmark className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}