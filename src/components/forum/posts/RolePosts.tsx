'use client';

import { useState, useEffect, useCallback } from 'react';
import { ForumPostCard } from '@/components/forum/ForumPostCard';
import { getPostsByAuthorRole } from '@/lib/services/forum';
import { Skeleton } from '@/components/ui/skeleton';

interface RolePostsProps {
  role: string;
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

export function RolePosts({ role }: RolePostsProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchPostsByAuthorRole = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPostsByAuthorRole(role);
      setPosts(data.posts);
    } catch (error) {
      console.error('Error fetching posts by author role:', error);
    } finally {
      setLoading(false);
    }
  }, [role]);
  
  useEffect(() => {
    fetchPostsByAuthorRole();
  }, [role, fetchPostsByAuthorRole]);
  
  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Posts by {role}s</h3>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Posts by {role}s</h3>
      {posts.length > 0 ? (
        posts.map((post) => (
          <ForumPostCard key={post._id} post={post} />
        ))
      ) : (
        <p className="text-muted-foreground text-sm">No posts found by {role}s.</p>
      )}
    </div>
  );
}
