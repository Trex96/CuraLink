'use client';

import { Suspense } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { AdvancedSearch } from '@/components/forum/AdvancedSearch';
import { Loader2 } from 'lucide-react';

export default function ForumSearchPage() {
  return (
    <div className="container py-8">
      <PageHeader
        title="Search Forum"
        description="Find discussions, questions, and answers in our community forum."
      />

      <div className="mt-8">
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }>
          <AdvancedSearch />
        </Suspense>
      </div>
    </div>
  );
}