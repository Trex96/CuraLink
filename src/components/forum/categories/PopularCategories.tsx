'use client';

import { useState, useEffect } from 'react';
import { ForumCategoryCard } from './ForumCategoryCard';
import { getPopularCategories } from '@/lib/services/forum';
import { Skeleton } from '@/components/ui/skeleton';

interface Category {
  _id: string;
  name: string;
  description: string;
  diseaseCategory: string;
}

export function PopularCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchPopularCategories();
  }, []);
  
  const fetchPopularCategories = async () => {
    try {
      setLoading(true);
      const popularCategories = await getPopularCategories();
      setCategories(popularCategories);
    } catch (error) {
      console.error('Error fetching popular categories:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Popular Categories</h3>
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
      <h3 className="text-lg font-semibold">Popular Categories</h3>
      {categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <ForumCategoryCard key={category._id} category={category} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">No popular categories found.</p>
      )}
    </div>
  );
}