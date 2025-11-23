'use client';

import { useState, useEffect, useCallback } from 'react';
import { ForumPostCard } from '@/components/forum/ForumPostCard';
import { getPostsByVerificationStatus } from '@/lib/services/forum';
import { Skeleton } from '@/components/ui/skeleton';

interface VerifiedPostsProps {
  isVerified: boolean;
}

interface Post {
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
  replyCount: number;
  isResearcherVerified?: boolean;
}

export function VerifiedPosts({ isVerified }: VerifiedPostsProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchPostsByVerificationStatus = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPostsByVerificationStatus(isVerified);
      setPosts(data.posts);
    } catch (error) {
      console.error('Error fetching posts by verification status:', error);
    } finally {
      setLoading(false);
    }
  }, [isVerified]);
  
  useEffect(() => {
    fetchPostsByVerificationStatus();
  }, [isVerified, fetchPostsByVerificationStatus]);
  
  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{isVerified ? 'Verified' : 'Unverified'} Posts</h3>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{isVerified ? 'Verified' : 'Unverified'} Posts</h3>
      {posts.length > 0 ? (
        posts.map((post) => (
          <ForumPostCard key={post._id} post={post} />
        ))
      ) : (
        <p className="text-muted-foreground text-sm">No {isVerified ? 'verified' : 'unverified'} posts found.</p>
      )}
    </div>
  );
}
