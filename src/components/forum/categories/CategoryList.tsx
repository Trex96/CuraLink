'use client';

import { useState, useEffect } from 'react';
import { ForumCategoryCard } from './ForumCategoryCard';
import { getForumCategories } from '@/lib/services/forum';
import { Skeleton } from '@/components/ui/skeleton';

interface CategoryListProps {
  categories?: Array<{
    _id: string;
    name: string;
    description: string;
    diseaseCategory: string;
  }>;
}

export function CategoryList({ categories: initialCategories }: CategoryListProps) {
  const [categories, setCategories] = useState(initialCategories || []);
  const [loading, setLoading] = useState(!initialCategories);
  
  useEffect(() => {
    if (!initialCategories) {
      fetchCategories();
    }
  }, [initialCategories]);
  
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const fetchedCategories = await getForumCategories();
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category) => (
        <ForumCategoryCard key={category._id} category={category} />
      ))}
    </div>
  );
}