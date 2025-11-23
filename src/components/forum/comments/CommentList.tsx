'use client';

import { useState, useEffect, useCallback } from 'react';
import { CommentItem } from './CommentItem';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Component for displaying a flat list of comments (no threading)
interface Comment {
  _id: string;
  authorId: {
    _id: string;
    firstName: string;
    lastName: string;
    role: string;
    profilePicture?: string;
  };
  content: string;
  upvotes: string[];
  createdAt: string;
  updatedAt: string;
  isVerifiedAnswer?: boolean;
}

interface CommentListProps {
  postId: string;
  currentUser: {
    id: string;
    role: string;
  } | null;
  onEdit: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  onUpvote: (commentId: string) => void;
  onVerify?: (commentId: string) => void; // New prop for verification
}

export function CommentList({ 
  postId, 
  currentUser,
  onEdit,
  onDelete,
  onUpvote,
  onVerify
}: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'upvotes'>('newest');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalComments, setTotalComments] = useState(0);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/forum/posts/${postId}/comments?limit=10&offset=${offset}&sortBy=${sortBy}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      
      const data = await response.json();
      setComments(prev => offset === 0 ? data.comments : [...prev, ...data.comments]);
      setHasMore(data.comments.length === 10);
      setTotalComments(data.total);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  }, [postId, offset, sortBy]);

  useEffect(() => {
    setOffset(0);
    fetchComments();
  }, [postId, sortBy, fetchComments]);

  const handleLoadMore = () => {
    setOffset(prev => prev + 10);
    fetchComments();
  };

  const handleSortChange = (value: string) => {
    setSortBy(value as 'newest' | 'oldest' | 'upvotes');
  };

  // Removed client-side duplicate filtering; show all fetched comments

  if (loading && comments.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-lg border p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-gray-200" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          Comments ({totalComments})
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="upvotes">Most Upvoted</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentItem
            key={comment._id}
            comment={comment}
            currentUser={currentUser}
            onEdit={onEdit}
            onDelete={onDelete}
            onUpvote={onUpvote}
            onVerify={onVerify}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More Comments'}
          </Button>
        </div>
      )}
    </div>
  );
}