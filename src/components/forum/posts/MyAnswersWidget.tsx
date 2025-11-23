'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ForumPostCard } from '@/components/forum/PostCard';
import { getResearcherAnswers } from '@/lib/services/forum';

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

export function MyAnswersWidget() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyAnswers = async () => {
      try {
        setLoading(true);
        // In a real implementation, we would pass the researcher ID
        const data = await getResearcherAnswers('current-researcher-id');
        setPosts(data.posts);
      } catch (error) {
        console.error('Error fetching my answers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyAnswers();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Questions You&apos;ve Answered</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <ForumPostCard key={post._id} post={post} />
            ))}
            <Button variant="outline" className="w-full">
              View All My Answers
            </Button>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            You haven&apos;t answered any questions yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}