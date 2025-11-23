'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPosts } from '@/components/forum/posts';
import { UserComments } from '@/components/forum/user';
import { UserUpvotedPosts } from '@/components/forum/posts';
import { UserFollowedCategories } from '@/components/forum/categories';
import { ForumNotifications } from '@/components/forum/notifications';
import { UserForumStats } from '@/components/forum/user';

export default function ForumDashboardPage() {
  const [activeTab, setActiveTab] = useState('posts');
  
  return (
    <div className="container py-8">
      <PageHeader 
        title="Forum Dashboard" 
        description="Manage your forum activity and stay updated with community discussions."
      />
      
      <div className="mb-6">
        <UserForumStats />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
          <TabsTrigger value="posts">Your Posts</TabsTrigger>
          <TabsTrigger value="comments">Your Comments</TabsTrigger>
          <TabsTrigger value="upvoted">Upvoted</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts" className="mt-6">
          <UserPosts />
        </TabsContent>
        
        <TabsContent value="comments" className="mt-6">
          <UserComments />
        </TabsContent>
        
        <TabsContent value="upvoted" className="mt-6">
          <UserUpvotedPosts />
        </TabsContent>
        
        <TabsContent value="categories" className="mt-6">
          <UserFollowedCategories />
        </TabsContent>
        
        <TabsContent value="notifications" className="mt-6">
          <ForumNotifications />
        </TabsContent>
      </Tabs>
    </div>
  );
}