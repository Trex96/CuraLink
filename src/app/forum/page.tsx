'use client';

import { Suspense } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AdvancedSearch } from '@/components/forum/AdvancedSearch';
import { PlusCircle, Loader2 } from 'lucide-react';

export default function ForumPage() {
  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <PageHeader
          title="Community Forum"
          description="Connect with patients and researchers to discuss health conditions, treatments, and research."
          className="mb-0"
        />
        <Link href="/forum/create">
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            New Discussion
          </Button>
        </Link>
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }>
        <AdvancedSearch basePath="/forum" />
      </Suspense>
    </div>
  );
}