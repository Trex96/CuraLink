'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VerifiedPosts } from '@/components/forum/posts';
import { RolePosts } from '@/components/forum/posts';
import { HighEngagementPosts } from '@/components/forum/posts';

export default function ForumModerationPage() {
  const [activeTab, setActiveTab] = useState('verified');
  
  return (
    <div className="container py-8">
      <PageHeader 
        title="Forum Moderation" 
        description="Manage and review forum content and user activity."
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="verified">Verified Posts</TabsTrigger>
          <TabsTrigger value="unverified">Unverified Posts</TabsTrigger>
          <TabsTrigger value="researchers">Researcher Posts</TabsTrigger>
          <TabsTrigger value="high-engagement">High Engagement</TabsTrigger>
        </TabsList>
        
        <TabsContent value="verified" className="mt-6">
          <VerifiedPosts isVerified={true} />
        </TabsContent>
        
        <TabsContent value="unverified" className="mt-6">
          <VerifiedPosts isVerified={false} />
        </TabsContent>
        
        <TabsContent value="researchers" className="mt-6">
          <RolePosts role="researcher" />
        </TabsContent>
        
        <TabsContent value="high-engagement" className="mt-6">
          <HighEngagementPosts />
        </TabsContent>
      </Tabs>
    </div>
  );
}