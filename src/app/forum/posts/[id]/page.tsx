'use client';

import { useState, useEffect, use } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PostDetail } from '@/components/forum/posts';
import EditPostDialog from '@/components/forum/forms/containers/EditPostDialog';
import { PostFormData } from '@/components/forum/forms/types';
import { CommentsSection } from '@/components/forum/comments/CommentsSection';
import { useSession } from 'next-auth/react';

interface Post {
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
  replyCount: number;
  isResearcherVerified: boolean;
  attachments?: { url: string; name: string; size: number }[];
}

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const { id } = use(params);
  
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/forum/posts/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch post');
        }
        const data = await response.json();
        setPost(data.post);
      } catch (error) {
        console.error('Error fetching post:', error);
        toast.error('Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleBack = () => {
    router.back();
  };
  
  const handleUpvote = async (postId: string) => {
    if (!post) return;
    
    // Require auth to vote
    const currentUserId = (session?.user as { id?: string } | undefined)?.id;
    if (!currentUserId) {
      toast.error('Please sign in to vote');
      return;
    }
    
    try {
      const targetId = postId || post._id;
      const response = await fetch(`/api/forum/posts/${targetId}/upvote`, {
        method: 'PUT',
      });
      
      if (!response.ok) {
        const msg = await response.text();
        throw new Error(msg || 'Failed to upvote post');
      }
      
      const data = await response.json();
      
      // Update the post state to reflect server toggle
      setPost({
        ...post,
        upvotes: data.upvoted
          ? [...post.upvotes.filter(id => id !== currentUserId), currentUserId]
          : post.upvotes.filter(id => id !== currentUserId)
      });
      
      toast.success(data.upvoted ? 'Post liked' : 'Like removed');
    } catch (error) {
      console.error('Error upvoting post:', error);
      toast.error('Failed to upvote post');
    }
  };
  
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Post link copied to clipboard!');
  };
  
  const handleFollow = () => {
    // In a real implementation, this would follow the post
    toast.success('You are now following this post');
  };
  
  const handleEdit = () => {
    setEditOpen(true);
  };
  
  const handleDelete = async () => {
    if (!post) return;
    
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/forum/posts/${post._id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete post');
      }
      
      toast.success('Post deleted successfully!');
      router.push('/forum');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };
  
  const handleVerify = async () => {
    if (!post) return;
    
    try {
      const response = await fetch(`/api/forum/posts/${post._id}/verify`, {
        method: 'PUT',
      });
      
      if (!response.ok) {
        throw new Error('Failed to verify post');
      }
      
      const data = await response.json();
      setPost({ ...post, isResearcherVerified: data.post.isResearcherVerified });
      
      toast.success('Post verified successfully!');
    } catch (error) {
      console.error('Error verifying post:', error);
      toast.error('Failed to verify post');
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Post not found</h2>
          <Button onClick={handleBack} className="mt-4">Back to Forum</Button>
        </div>
      </div>
    );
  }
  
  const currentUser = session?.user ? {
    id: (session.user as { id: string }).id,
    role: (session.user as { role: string }).role || 'user'
  } : null;
  
  return (
    <div className="container py-8">
      <Button variant="ghost" className="mb-4 flex items-center gap-2" onClick={handleBack}>
        <ArrowLeft className="h-4 w-4" />
        Back to Forum
      </Button>
      
      <PostDetail
        post={post}
        currentUser={currentUser}
        onUpvote={handleUpvote}
        onShare={handleShare}
        onFollow={handleFollow}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onVerify={handleVerify}
      />
      
      <CommentsSection 
        postId={post._id} 
        currentUser={currentUser} 
      />

      <EditPostDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        initial={{
          title: post.title,
          content: post.content,
          category: post.category,
          tags: post.tags,
        }}
        onSubmit={async (values: PostFormData) => {
          try {
            const response = await fetch(`/api/forum/posts/${post._id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(values),
            });
            if (!response.ok) {
              throw new Error('Failed to update post');
            }
            const data = await response.json();
            setPost(data.post);
            toast.success('Post updated successfully');
          } catch (err) {
            console.error(err);
            toast.error('Could not update post');
          }
        }}
      />
    </div>
  );
}