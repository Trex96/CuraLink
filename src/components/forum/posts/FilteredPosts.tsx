'use client';

import { useState, useEffect, useCallback } from 'react';
import { ForumPostCard } from '@/components/forum/PostCard';
import { getFilteredPosts } from '@/lib/services/forum';
import { Skeleton } from '@/components/ui/skeleton';

interface FilteredPostsProps {
  filters: {
    category?: string;
    tag?: string;
    authorId?: string;
    sort?: 'createdAt' | 'upvotes' | 'replies';
  };
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

export function FilteredPosts({ filters }: FilteredPostsProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchFilteredPosts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getFilteredPosts(filters);
      setPosts(data.posts);
    } catch (error) {
      console.error('Error fetching filtered posts:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);
  
  useEffect(() => {
    fetchFilteredPosts();
  }, [filters, fetchFilteredPosts]);
  
  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Filtered Posts</h3>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Filtered Posts</h3>
      {posts.length > 0 ? (
        posts.map((post) => (
          <ForumPostCard key={post._id} post={post} />
        ))
      ) : (
        <p className="text-muted-foreground text-sm">No posts match the selected filters.</p>
      )}
    </div>
  );
}