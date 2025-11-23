'use client';

import { useState, useEffect } from 'react';
import { ForumPostCard } from '@/components/forum/ForumPostCard';
import { getUserPosts } from '@/lib/services/forum';
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

export function UserPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchUserPosts();
  }, []);
  
  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      const data = await getUserPosts();
      setPosts(data.posts);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Your Posts</h3>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Your Posts</h3>
      {posts.length > 0 ? (
        posts.map((post) => (
          <ForumPostCard key={post._id} post={post} />
        ))
      ) : (
        <p className="text-muted-foreground text-sm">You have not created any posts yet.</p>
      )}
    </div>
  );
}
