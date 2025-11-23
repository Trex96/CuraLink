'use client';

import { useState, useEffect, useCallback } from 'react';
import { getPostStats } from '@/lib/services/forum';
import { ThumbsUp, MessageCircle, Eye } from 'lucide-react';

interface PostStatsProps {
  postId: string;
}

export function PostStats({ postId }: PostStatsProps) {
  const [stats, setStats] = useState({
    upvotes: 0,
    replies: 0,
    views: 0
  });
  const [loading, setLoading] = useState(true);
  
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const statsData = await getPostStats(postId);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching post stats:', error);
    } finally {
      setLoading(false);
    }
  }, [postId]);
  
  useEffect(() => {
    fetchStats();
  }, [postId, fetchStats]);
  
  if (loading) {
    return (
      <div className="flex gap-4 text-sm text-muted-foreground">
        <span>Loading...</span>
      </div>
    );
  }
  
  return (
    <div className="flex gap-4 text-sm text-muted-foreground">
      <div className="flex items-center gap-1">
        <ThumbsUp className="h-4 w-4" />
        <span>{stats.upvotes}</span>
      </div>
      <div className="flex items-center gap-1">
        <MessageCircle className="h-4 w-4" />
        <span>{stats.replies}</span>
      </div>
      <div className="flex items-center gap-1">
        <Eye className="h-4 w-4" />
        <span>{stats.views}</span>
      </div>
    </div>
  );
}