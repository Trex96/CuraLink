'use client';

import { useState, useEffect, useCallback } from 'react';
import { ForumPostCard } from '@/components/forum/ForumPostCard';
import { getPostsByTimeOfDay } from '@/lib/services/forum';
import { Skeleton } from '@/components/ui/skeleton';

interface TimeOfDayPostsProps {
  time: 'morning' | 'afternoon' | 'evening' | 'night';
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

export function TimeOfDayPosts({ time }: TimeOfDayPostsProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchPostsByTimeOfDay = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPostsByTimeOfDay(time);
      setPosts(data.posts);
    } catch (error) {
      console.error('Error fetching posts by time of day:', error);
    } finally {
      setLoading(false);
    }
  }, [time]);
  
  useEffect(() => {
    fetchPostsByTimeOfDay();
  }, [time, fetchPostsByTimeOfDay]);
  
  const timeLabels = {
    morning: 'Morning (6 AM - 12 PM)',
    afternoon: 'Afternoon (12 PM - 6 PM)',
    evening: 'Evening (6 PM - 12 AM)',
    night: 'Night (12 AM - 6 AM)'
  };
  
  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Posts from {timeLabels[time]}</h3>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Posts from {timeLabels[time]}</h3>
      {posts.length > 0 ? (
        posts.map((post) => (
          <ForumPostCard key={post._id} post={post} />
        ))
      ) : (
        <p className="text-muted-foreground text-sm">No posts found from this time period.</p>
      )}
    </div>
  );
}
