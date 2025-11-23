'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Clock, User } from 'lucide-react';
import Link from 'next/link';

interface ForumPost {
  _id: string;
  title: string;
  category: string;
  author: string;
  replies: number;
  lastActivity: string;
}

export function RecentForumActivity({ posts, loading, error }: {
  posts: ForumPost[];
  loading: boolean;
  error: string | null;
}) {
  if (loading) {
    return (
      <Card className="h-full border-muted bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="mr-2 h-5 w-5 text-primary" />
            Recent Forum Activity
          </CardTitle>
          <CardDescription>Latest discussions in the community</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-16" />
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
      <Card className="h-full border-muted bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="mr-2 h-5 w-5 text-primary" />
            Recent Forum Activity
          </CardTitle>
          <CardDescription>Latest discussions in the community</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">Failed to load forum activity: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border-muted bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="mr-2 h-5 w-5 text-primary" />
          Recent Forum Activity
        </CardTitle>
        <CardDescription>Latest discussions in the community</CardDescription>
      </CardHeader>
      <CardContent>
        {posts.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="mt-2 text-sm font-medium">No recent activity</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              There&apos;s no recent forum activity to show.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post._id} className="group space-y-3 pb-6 border-b last:border-0 last:pb-0">
                <div className="space-y-1">
                  <Link href={`/forum/${post._id}`} className="block">
                    <h4 className="font-semibold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h4>
                  </Link>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {post.category}
                    </span>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      {post.replies}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    <span className="truncate max-w-[100px]">{post.author}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{post.lastActivity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-6 pt-4 border-t">
          <Button variant="ghost" className="w-full text-primary hover:text-primary/80 hover:bg-primary/5" asChild>
            <Link href="/forum">
              Visit Forum
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}