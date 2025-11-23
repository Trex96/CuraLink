'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock } from 'lucide-react';

interface ResearcherOnlyThreadProps {
  thread: {
    _id: string;
    title: string;
    content: string;
    authorId: {
      firstName: string;
      lastName: string;
      institution: string;
    };
    createdAt: string;
    replyCount: number;
  };
}

export function ResearcherOnlyThread({ thread }: ResearcherOnlyThreadProps) {
  return (
    <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg flex items-center gap-2">
            <Lock className="h-4 w-4" />
            {thread.title}
          </CardTitle>
          <Badge variant="secondary">Researchers Only</Badge>
        </div>
        <CardDescription>
          By {thread.authorId.firstName} {thread.authorId.lastName} at {thread.authorId.institution}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-2 text-muted-foreground mb-4">{thread.content}</p>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            {new Date(thread.createdAt).toLocaleDateString()}
          </span>
          <Badge variant="outline">{thread.replyCount} replies</Badge>
        </div>
      </CardContent>
    </Card>
  );
}