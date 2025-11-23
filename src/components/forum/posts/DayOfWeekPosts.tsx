'use client';

import { useState, useEffect, useCallback } from 'react';
import { ForumPostCard } from '@/components/forum/PostCard';
import { getPostsByDayOfWeek } from '@/lib/services/forum';
import { Skeleton } from '@/components/ui/skeleton';

interface DayOfWeekPostsProps {
  day: 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
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

export function DayOfWeekPosts({ day }: DayOfWeekPostsProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchPostsByDayOfWeek = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPostsByDayOfWeek(day);
      setPosts(data.posts);
    } catch (error) {
      console.error('Error fetching posts by day of week:', error);
    } finally {
      setLoading(false);
    }
  }, [day]);
  
  useEffect(() => {
    fetchPostsByDayOfWeek();
  }, [day, fetchPostsByDayOfWeek]);
  
  const dayLabels = {
    sunday: 'Sunday',
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday'
  };
  
  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Posts from {dayLabels[day]}s</h3>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Posts from {dayLabels[day]}s</h3>
      {posts.length > 0 ? (
        posts.map((post) => (
          <ForumPostCard key={post._id} post={post} />
        ))
      ) : (
        <p className="text-muted-foreground text-sm">No posts found from this day of the week.</p>
      )}
    </div>
  );
}