'use client';

import { useState, useEffect, useCallback } from 'react';
import { ForumPostCard } from '@/components/forum/ForumPostCard';
import { getPostsBySeason } from '@/lib/services/forum';
import { Skeleton } from '@/components/ui/skeleton';

interface SeasonPostsProps {
  season: 'spring' | 'summer' | 'autumn' | 'winter';
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

export function SeasonPosts({ season }: SeasonPostsProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchPostsBySeason = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPostsBySeason(season);
      setPosts(data.posts);
    } catch (error) {
      console.error('Error fetching posts by season:', error);
    } finally {
      setLoading(false);
    }
  }, [season]);
  
  useEffect(() => {
    fetchPostsBySeason();
  }, [season, fetchPostsBySeason]);
  
  const seasonLabels = {
    spring: 'Spring',
    summer: 'Summer',
    autumn: 'Autumn',
    winter: 'Winter'
  };
  
  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Posts from {seasonLabels[season]}</h3>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Posts from {seasonLabels[season]}</h3>
      {posts.length > 0 ? (
        posts.map((post) => (
          <ForumPostCard key={post._id} post={post} />
        ))
      ) : (
        <p className="text-muted-foreground text-sm">No posts found from this season.</p>
      )}
    </div>
  );
}
