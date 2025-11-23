'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ForumPostCard } from '@/components/forum/PostCard';
import { getUnansweredQuestionsInField } from '@/lib/services/forum';

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

export function UnansweredQuestionsWidget() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUnansweredQuestions = async () => {
      try {
        setLoading(true);
        const data = await getUnansweredQuestionsInField();
        setPosts(data.posts);
      } catch (error) {
        console.error('Error fetching unanswered questions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUnansweredQuestions();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Unanswered Questions in Your Field</CardTitle>
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
              View All Unanswered Questions
            </Button>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            No unanswered questions in your expertise areas at the moment.
          </p>
        )}
      </CardContent>
    </Card>
  );
}