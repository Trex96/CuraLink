'use client';

import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { ExportForumData } from '@/components/forum/utilities';
import Link from 'next/link';

export default function ForumAdminPage() {
  return (
    <div className="container py-8">
      <PageHeader 
        title="Forum Administration" 
        description="Manage forum categories, content, and export data."
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Manage Categories</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Create, edit, or delete forum categories and disease topics.
          </p>
          <Link href="/forum/admin/categories">
            <Button variant="outline">Manage Categories</Button>
          </Link>
        </div>
        
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Export Data</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Export all forum data including posts, comments, and categories.
          </p>
          <ExportForumData />
        </div>
        
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Content Moderation</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Review and moderate forum posts and comments for appropriate content.
          </p>
          <Link href="/forum/moderation">
            <Button variant="outline">Moderate Content</Button>
          </Link>
        </div>
        
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Analytics</h3>
          <p className="text-muted-foreground text-sm mb-4">
            View detailed analytics and insights about forum activity.
          </p>
          <Link href="/forum/analytics">
            <Button variant="outline">View Analytics</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}