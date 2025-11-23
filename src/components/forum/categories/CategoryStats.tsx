'use client';

import { useState, useEffect } from 'react';
import { getCategoryStats } from '@/lib/services/forum';
import { Skeleton } from '@/components/ui/skeleton';

export function CategoryStats() {
  const [stats, setStats] = useState<{_id: string, count: number}[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchCategoryStats();
  }, []);
  
  const fetchCategoryStats = async () => {
    try {
      setLoading(true);
      const categoryStats = await getCategoryStats();
      setStats(categoryStats);
    } catch (error) {
      console.error('Error fetching category stats:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Category Statistics</h3>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Category Statistics</h3>
      <div className="space-y-2">
        {stats.map((stat) => (
          <div key={stat._id} className="flex justify-between items-center">
            <span className="font-medium">{stat._id}</span>
            <span className="text-muted-foreground">{stat.count} posts</span>
          </div>
        ))}
      </div>
    </div>
  );
}