'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle, MessageSquare } from 'lucide-react';
import Link from 'next/link';

interface ForumPost {
  _id: string;
  title: string;
  category: string;
  author: string;
  replies: number;
  lastActivity: string;
}

export function ForumActivity({ posts, loading, error }: { 
  posts: ForumPost[]; 
  loading: boolean; 
  error: string | null;
}) {
  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="mr-2 h-5 w-5" />
            Forum Activity
          </CardTitle>
          <CardDescription>Recent questions in your expertise area</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="mr-2 h-5 w-5" />
            Forum Activity
          </CardTitle>
          <CardDescription>Recent questions in your expertise area</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Failed to load forum activity: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="mr-2 h-5 w-5" />
          Forum Activity
        </CardTitle>
        <CardDescription>Recent questions in your expertise area</CardDescription>
      </CardHeader>
      <CardContent>
        {posts.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium">No recent forum activity</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              No recent questions in your expertise area.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post._id} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="bg-secondary h-10 w-10 rounded-full flex items-center justify-center">
                    <MessageCircle className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {post.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {post.category} • {post.replies} replies
                  </p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs">by {post.author}</span>
                    <span className="text-xs text-muted-foreground">
                      {post.lastActivity}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-6">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/forum">
              View Forum
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}