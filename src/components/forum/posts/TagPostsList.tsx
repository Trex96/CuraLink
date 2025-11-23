'use client';

import { useState, useEffect, useCallback } from 'react';
import { ForumPostCard } from '@/components/forum/ForumPostCard';
import { getPostsByTags } from '@/lib/services/forum';
import { Skeleton } from '@/components/ui/skeleton';

interface TagPostsListProps {
  tags: string[];
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

export function TagPostsList({ tags }: TagPostsListProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchPostsByTags = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPostsByTags(tags);
      setPosts(data.posts);
    } catch (error) {
      console.error('Error fetching posts by tags:', error);
    } finally {
      setLoading(false);
    }
  }, [tags]);
  
  useEffect(() => {
    fetchPostsByTags();
  }, [tags, fetchPostsByTags]);
  
  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Posts tagged with {tags.join(', ')}</h3>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Posts tagged with {tags.join(', ')}</h3>
      {posts.length > 0 ? (
        posts.map((post) => (
          <ForumPostCard key={post._id} post={post} />
        ))
      ) : (
        <p className="text-muted-foreground text-sm">No posts found with the selected tags.</p>
      )}
    </div>
  );
}
