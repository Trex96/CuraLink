'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Edit,
  Trash2,
  Verified,
  CheckCircle
} from 'lucide-react';
import useRelativeTime from '@/hooks/useRelativeTime';
import { CommentActions } from './CommentActions';

// Component for displaying a single comment (no replies)
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
  isVerifiedAnswer?: boolean; // New field for verification status
}

interface CommentItemProps {
  comment: Comment;
  currentUser: {
    id: string;
    role: string;
  } | null;
  onEdit: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  onUpvote: (commentId: string) => void;
  onVerify?: (commentId: string) => void; // New prop for verification
}

export function CommentItem({
  comment,
  currentUser,
  onEdit,
  onDelete,
  onUpvote,
  onVerify
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const relativeTime = useRelativeTime(comment.createdAt);

  const isOwnComment = currentUser?.id === comment.authorId._id;
  const isResearcher = comment.authorId.role === 'researcher';

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    onEdit(comment._id, editContent);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this comment?')) {
      onDelete(comment._id);
    }
  };

  const handleUpvote = () => {
    onUpvote(comment._id);
  };

  const handleVerify = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    onVerify && onVerify(comment._id);
  };

  return (
    <div>
      <Card>
        <CardHeader className="py-3 px-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="font-medium">
                {comment.authorId.firstName} {comment.authorId.lastName}
              </div>
              {isResearcher && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Verified className="h-3 w-3" />
                  Researcher
                </Badge>
              )}
              {comment.isVerifiedAnswer && (
                <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3" />
                  Verified Answer
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {relativeTime}
              </span>
            </div>
            {isOwnComment && (
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={handleEdit}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="py-3 px-4">
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveEdit}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm">{comment.content}</p>
          )}
        </CardContent>
        <CardFooter className="py-3 px-4">
          <CommentActions
            commentId={comment._id}
            upvotes={comment.upvotes}
            currentUser={currentUser}
            onUpvote={handleUpvote}
            onVerify={handleVerify}
            isVerifiedAnswer={comment.isVerifiedAnswer}
          />
        </CardFooter>
      </Card>
    </div>
  );
}