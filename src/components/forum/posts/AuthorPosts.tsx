'use client';

import { useState, useEffect, useCallback } from 'react';
import { ForumPostCard } from '@/components/forum/ForumPostCard';
import { getPostsByAuthor } from '@/lib/services/forum';
import { Skeleton } from '@/components/ui/skeleton';

interface AuthorPostsProps {
  authorId: string;
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

export function AuthorPosts({ authorId }: AuthorPostsProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchPostsByAuthor = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPostsByAuthor(authorId);
      setPosts(data.posts);
    } catch (error) {
      console.error('Error fetching posts by author:', error);
    } finally {
      setLoading(false);
    }
  }, [authorId]);
  
  useEffect(() => {
    fetchPostsByAuthor();
  }, [authorId, fetchPostsByAuthor]);
  
  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Posts by Author</h3>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Posts by Author</h3>
      {posts.length > 0 ? (
        posts.map((post) => (
          <ForumPostCard key={post._id} post={post} />
        ))
      ) : (
        <p className="text-muted-foreground text-sm">No posts found by this author.</p>
      )}
    </div>
  );
}
