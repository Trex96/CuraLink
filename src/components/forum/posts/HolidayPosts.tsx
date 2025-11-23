'use client';

import { useState, useEffect, useCallback } from 'react';
import { ForumPostCard } from '@/components/forum/PostCard';
import { getPostsByHoliday } from '@/lib/services/forum';
import { Skeleton } from '@/components/ui/skeleton';

interface HolidayPostsProps {
  holiday: 'new-year' | 'valentines' | 'easter' | 'independence' | 'halloween' | 'thanksgiving' | 'christmas';
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

export function HolidayPosts({ holiday }: HolidayPostsProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchPostsByHoliday = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPostsByHoliday(holiday);
      setPosts(data.posts);
    } catch (error) {
      console.error('Error fetching posts by holiday:', error);
    } finally {
      setLoading(false);
    }
  }, [holiday]);
  
  useEffect(() => {
    fetchPostsByHoliday();
  }, [holiday, fetchPostsByHoliday]);
  
  const holidayLabels = {
    'new-year': 'New Year\'s Day',
    'valentines': 'Valentine\'s Day',
    'easter': 'Easter',
    'independence': 'Independence Day',
    'halloween': 'Halloween',
    'thanksgiving': 'Thanksgiving',
    'christmas': 'Christmas'
  };
  
  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Posts from {holidayLabels[holiday]}</h3>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Posts from {holidayLabels[holiday]}</h3>
      {posts.length > 0 ? (
        posts.map((post) => (
          <ForumPostCard key={post._id} post={post} />
        ))
      ) : (
        <p className="text-muted-foreground text-sm">No posts found from this holiday.</p>
      )}
    </div>
  );
}