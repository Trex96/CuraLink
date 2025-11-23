'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getUserComments } from '@/lib/services/forum';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  _id: string;
  content: string;
  postId?: {
    title?: string;
  };
  createdAt: string;
}

export function UserComments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchUserComments();
  }, []);
  
  const fetchUserComments = async () => {
    try {
      setLoading(true);
      const data = await getUserComments();
      setComments(data.comments);
    } catch (error) {
      console.error('Error fetching user comments:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Your Comments</h3>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Your Comments</h3>
      {comments.length > 0 ? (
        comments.map((comment) => (
          <Card key={comment._id}>
            <CardHeader>
              <CardTitle className="text-lg">
                Re: {comment.postId?.title || 'Untitled Post'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="line-clamp-2 mb-2">{comment.content}</p>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </p>
            </CardContent>
          </Card>
        ))
      ) : (
        <p className="text-muted-foreground text-sm">You have not made any comments yet.</p>
      )}
    </div>
  );
}