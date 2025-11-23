'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { getAllTags } from '@/lib/services/forum';
import { Skeleton } from '@/components/ui/skeleton';

export function TagCloud() {
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchTags();
  }, []);
  
  const fetchTags = async () => {
    try {
      setLoading(true);
      const allTags = await getAllTags();
      setTags(allTags);
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Popular Tags</h3>
        <div className="flex flex-wrap gap-2">
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="h-6 w-16" />
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Popular Tags</h3>
      <div className="flex flex-wrap gap-2">
        {tags.slice(0, 20).map((tag) => (
          <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-secondary/80">
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
}