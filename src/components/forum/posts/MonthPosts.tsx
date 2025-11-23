'use client';

import { useState, useEffect, useCallback } from 'react';
import { ForumPostCard } from '@/components/forum/PostCard';
import { getPostsByMonth } from '@/lib/services/forum';
import { Skeleton } from '@/components/ui/skeleton';

interface MonthPostsProps {
  month: 'january' | 'february' | 'march' | 'april' | 'may' | 'june' | 'july' | 'august' | 'september' | 'october' | 'november' | 'december';
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

export function MonthPosts({ month }: MonthPostsProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchPostsByMonth = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPostsByMonth(month);
      setPosts(data.posts);
    } catch (error) {
      console.error('Error fetching posts by month:', error);
    } finally {
      setLoading(false);
    }
  }, [month]);
  
  useEffect(() => {
    fetchPostsByMonth();
  }, [month, fetchPostsByMonth]);
  
  const monthLabels = {
    january: 'January',
    february: 'February',
    march: 'March',
    april: 'April',
    may: 'May',
    june: 'June',
    july: 'July',
    august: 'August',
    september: 'September',
    october: 'October',
    november: 'November',
    december: 'December'
  };
  
  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Posts from {monthLabels[month]}</h3>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Posts from {monthLabels[month]}</h3>
      {posts.length > 0 ? (
        posts.map((post) => (
          <ForumPostCard key={post._id} post={post} />
        ))
      ) : (
        <p className="text-muted-foreground text-sm">No posts found from this month.</p>
      )}
    </div>
  );
}