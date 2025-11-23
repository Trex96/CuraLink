'use client';

import { useState, useEffect, useCallback } from 'react';
import { ForumPostCard } from '@/components/forum/ForumPostCard';
import { getPostsByCategories } from '@/lib/services/forum';
import { Skeleton } from '@/components/ui/skeleton';

interface CategoryPostsProps {
  categories: string[];
}

export function CategoryPosts({ categories }: CategoryPostsProps) {
  const [posts, setPosts] = useState<React.ComponentProps<typeof ForumPostCard>['post'][]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchPostsByCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPostsByCategories(categories);
      setPosts(data.posts);
    } catch (error) {
      console.error('Error fetching posts by categories:', error);
    } finally {
      setLoading(false);
    }
  }, [categories]);
  
  useEffect(() => {
    fetchPostsByCategories();
  }, [categories, fetchPostsByCategories]);
  
  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Posts in Selected Categories</h3>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Posts in Selected Categories</h3>
      {posts.length > 0 ? (
        posts.map((post) => (
          <ForumPostCard key={post._id} post={post} />
        ))
      ) : (
        <p className="text-muted-foreground text-sm">No posts found in the selected categories.</p>
      )}
    </div>
  );
}
