'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PostForm } from '@/components/forum/forms/PostForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createForumPost } from '@/lib/services/forum';
import { toast } from 'sonner';

export default function CreatePostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: {
    title: string;
    content: string;
    category: string;
    tags: string[];
    attachments?: { url: string; name: string; size: number }[];
  }) => {
    try {
      setLoading(true);
      await createForumPost(
        data.title,
        data.content,
        data.category,
        data.tags,
        data.attachments
      );

      toast.success('Post created successfully!');
      router.push(`/forum`);
    } catch (error) {
      console.error('Error creating post:', error);
      const message = error instanceof Error ? error.message : 'Failed to create post.';
      toast.error('Post creation failed', {
        description: message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Post</CardTitle>
        </CardHeader>
        <CardContent>
          <PostForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
