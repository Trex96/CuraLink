'use client';

import { Button } from '@/components/ui/button';
import { ThumbsUp, CheckCircle } from 'lucide-react';

interface CommentActionsProps {
  commentId: string;
  upvotes: string[];
  currentUser: {
    id: string;
    role: string;
  } | null;
  onUpvote: (commentId: string) => void;
  onVerify?: (commentId: string) => void; // New prop for verification
  isVerifiedAnswer?: boolean; // New prop to show verification status
}

export function CommentActions({ 
  commentId,
  upvotes,
  currentUser,
  onUpvote,
  onVerify,
  isVerifiedAnswer
}: CommentActionsProps) {
  const hasUpvoted = currentUser && upvotes.includes(currentUser.id);
  
  return (
    <div className="flex items-center gap-4">
      <Button 
        variant="ghost" 
        size="sm" 
        className="flex items-center gap-1 h-8 px-2"
        onClick={() => onUpvote(commentId)}
      >
        <ThumbsUp className={`h-4 w-4 ${hasUpvoted ? 'fill-current' : ''}`} />
        <span className="text-xs">{upvotes.length}</span>
      </Button>
      
      {currentUser?.role === 'researcher' && onVerify && !isVerifiedAnswer && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-1 h-8 px-2 text-green-600 hover:text-green-700"
          onClick={() => onVerify && onVerify(commentId)}
        >
          <CheckCircle className="h-4 w-4" />
          <span className="text-xs">Verify</span>
        </Button>
      )}
      
      {isVerifiedAnswer && (
        <div className="flex items-center gap-1 text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span className="text-xs">Verified Answer</span>
        </div>
      )}
    </div>
  );
}