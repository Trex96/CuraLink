'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ForumCategoryCard } from './ForumCategoryCard';
import { searchCategories } from '@/lib/services/forum';
import { Skeleton } from '@/components/ui/skeleton';

interface Category {
  _id: string;
  name: string;
  description: string;
  diseaseCategory: string;
}

export function CategorySearch() {
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  
  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setCategories([]);
      return;
    }
    
    try {
      setLoading(true);
      const searchResults = await searchCategories(searchQuery);
      setCategories(searchResults);
    } catch (error) {
      console.error('Error searching categories:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    handleSearch(value);
  };
  
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search categories..."
          className="pl-10"
          value={query}
          onChange={handleChange}
        />
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((category) => (
            <ForumCategoryCard key={category._id} category={category} />
          ))}
        </div>
      )}
    </div>
  );
}