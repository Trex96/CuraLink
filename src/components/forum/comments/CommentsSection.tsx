'use client';

import { useState } from 'react';
import { CommentList } from '@/components/forum/comments/CommentList';
import { CommentForm } from '@/components/forum/comments/CommentForm';
import { toast } from 'sonner';

interface CommentsSectionProps {
  postId: string;
  currentUser: {
    id: string;
    role: string;
  } | null;
}

export function CommentsSection({ postId, currentUser }: CommentsSectionProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreateComment = async (content: string) => {
    try {
      const trimmed = content.trim();
      if (!trimmed) {
        toast.error('Comment cannot be empty.');
        return;
      }


      const response = await fetch(`/api/forum/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ content: trimmed }),
      });

      if (!response.ok) {
        let message = 'Failed to create comment';
        try {
          const err = await response.json();
          if (err?.error) message = err.error;
        } catch { }
        throw new Error(`${message} (status ${response.status})`);
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const data = await response.json();
      toast.success('Comment added successfully!');
      // Refresh the comment list
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error creating comment:', error);
      const fallback = 'Failed to add comment. Please try again.';
      const msg = error instanceof Error ? error.message : fallback;
      toast.error(msg || fallback);
    }
  };

  const handleEditComment = async (commentId: string, content: string) => {
    try {
      const response = await fetch(`/api/forum/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Failed to update comment');
      }

      toast.success('Comment updated successfully!');
      // Refresh the comment list
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment. Please try again.');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/forum/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }

      toast.success('Comment deleted successfully!');
      // Refresh the comment list
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment. Please try again.');
    }
  };

  const handleUpvoteComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/forum/comments/${commentId}/upvote`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to upvote comment');
      }

      const data = await response.json();
      // The UI will update automatically based on the response
      if (data.upvoted) {
        toast.success('Comment upvoted!');
      } else {
        toast.success('Upvote removed!');
      }
    } catch (error) {
      console.error('Error upvoting comment:', error);
      toast.error('Failed to upvote comment. Please try again.');
    }
  };

  const handleVerifyComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/forum/comments/${commentId}/verify`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to verify comment');
      }

      const data = await response.json();
      if (data.success) {
        toast.success('Comment verified as helpful answer!');
        // Refresh the comment list
        setRefreshKey(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error verifying comment:', error);
      toast.error('Failed to verify comment. Please try again.');
    }
  };

  // Removed duplicate-removal UI and handlers

  return (
    <div className="space-y-6">
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium mb-4">Add a Comment</h3>
        <CommentForm
          onSubmit={handleCreateComment}
          onCancel={() => { }}
          placeholder="Write your comment..."
        />
      </div>

      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Comments</h3>
        </div>
        <CommentList
          key={refreshKey}
          postId={postId}
          currentUser={currentUser}
          onEdit={handleEditComment}
          onDelete={handleDeleteComment}
          onUpvote={handleUpvoteComment}
          onVerify={handleVerifyComment}
        />
      </div>
    </div>
  );
}