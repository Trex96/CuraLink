'use client';

import { useState, useEffect } from 'react';
import { ForumCategoryCard } from './ForumCategoryCard';
import { getUserFollowedCategories } from '@/lib/services/forum';
import { Skeleton } from '@/components/ui/skeleton';

interface Category {
  _id: string;
  name: string;
  description: string;
  diseaseCategory: string;
}

export function UserFollowedCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchUserFollowedCategories();
  }, []);
  
  const fetchUserFollowedCategories = async () => {
    try {
      setLoading(true);
      const followedCategories = await getUserFollowedCategories();
      setCategories(followedCategories);
    } catch (error) {
      console.error('Error fetching followed categories:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Followed Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Followed Categories</h3>
      {categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <ForumCategoryCard key={category._id} category={category} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">You are not following any categories yet.</p>
      )}
    </div>
  );
}