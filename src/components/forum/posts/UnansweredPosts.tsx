'use client';

import { useState, useEffect } from 'react';
import { ForumPostCard } from '@/components/forum/ForumPostCard';
import { getUnansweredPosts } from '@/lib/services/forum';
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

export function UnansweredPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchUnansweredPosts();
  }, []);
  
  const fetchUnansweredPosts = async () => {
    try {
      setLoading(true);
      const unansweredPosts = await getUnansweredPosts(5);
      setPosts(unansweredPosts);
    } catch (error) {
      console.error('Error fetching unanswered posts:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Unanswered Questions</h3>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Unanswered Questions</h3>
      {posts.length > 0 ? (
        posts.map((post) => (
          <ForumPostCard key={post._id} post={post} />
        ))
      ) : (
        <p className="text-muted-foreground text-sm">No unanswered questions at the moment.</p>
      )}
    </div>
  );
}
