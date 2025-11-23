'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Verified,
  Edit,
  Trash2,
  FileText,
  Download
} from 'lucide-react';
import useRelativeTime from '@/hooks/useRelativeTime';
import { PostActions } from '@/components/forum/posts';
import { VerifyAnswerButton } from '@/components/forum/comments/VerifyAnswerButton';

interface PostDetailProps {
  post: {
    _id: string;
    title: string;
    content: string;
    category: string;
    tags: string[];
    upvotes: string[];
    authorId: {
      _id: string;
      firstName: string;
      lastName: string;
      role: string;
    };
    createdAt: string;
    replyCount?: number;
    commentCount?: number;
    isResearcherVerified: boolean;
    isOwnPost?: boolean;
    attachments?: { url: string; name: string; size: number }[];
  };
  currentUser: {
    id: string;
    role: string;
  } | null;
  onUpvote: (postId: string) => void;
  onShare: (postId: string) => void;
  onFollow: (postId: string) => void;
  onEdit: (postId: string) => void;
  onDelete: (postId: string) => void;
  onVerify: (postId: string) => void;
}

export function PostDetail({
  post,
  currentUser,
  onUpvote,
  onShare,
  onFollow,
  onEdit,
  onDelete,
  onVerify
}: PostDetailProps) {
  const relativeTime = useRelativeTime(post.createdAt);


  const isOwnPost = currentUser?.id === post.authorId._id;
  const isResearcher = currentUser?.role === 'researcher';



  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDownloadAttachment = (url: string, name: string) => {
    // In a real implementation, this would trigger a download
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">{post.title}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                <span>{post.authorId.firstName} {post.authorId.lastName}</span>
                {post.authorId.role === 'researcher' && (
                  <Badge variant="outline">Researcher</Badge>
                )}
                <span>•</span>
                <span>{relativeTime}</span>
              </div>
            </div>
            <div className="flex gap-2">
              {isOwnPost && (
                <>
                  <Button variant="ghost" size="sm" onClick={() => onEdit(post._id)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(post._id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
              {post.isResearcherVerified && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Verified className="h-3 w-3" />
                  Verified
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none mb-4">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>

          {post.attachments && post.attachments.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Attachments:</h4>
              <div className="space-y-2">
                {post.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <div>
                        <p className="text-sm font-medium">{attachment.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadAttachment(attachment.url, attachment.name)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <PostActions
            postId={post._id}
            upvotes={post.upvotes}
            replyCount={post.replyCount}
            commentCount={post.commentCount}
            currentUser={currentUser}
            onUpvote={onUpvote}
            onShare={onShare}
            onFollow={onFollow}
          />
        </CardFooter>
      </Card>

      {isResearcher && !post.isResearcherVerified && (
        <div className="flex justify-end">
          <VerifyAnswerButton
            postId={post._id}
            onVerify={onVerify}
          />
        </div>
      )}

    </div>
  );
}