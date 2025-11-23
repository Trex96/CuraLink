'use client';

import { useState, useEffect } from 'react';
import { ForumPostCard } from '@/components/forum/ForumPostCard';
import { getRecentPosts } from '@/lib/services/forum';
import { Skeleton } from '@/components/ui/skeleton';

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

export function RecentPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchRecentPosts();
  }, []);
  
  const fetchRecentPosts = async () => {
    try {
      setLoading(true);
      const recentPosts = await getRecentPosts(5);
      setPosts(recentPosts);
    } catch (error) {
      console.error('Error fetching recent posts:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recent Posts</h3>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Recent Posts</h3>
      {posts.length > 0 ? (
        posts.map((post) => (
          <ForumPostCard key={post._id} post={post} />
        ))
      ) : (
        <p className="text-muted-foreground text-sm">No recent posts at the moment.</p>
      )}
    </div>
  );
}
