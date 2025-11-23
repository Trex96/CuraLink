'use client';

import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface InfiniteScrollProps {
  children: React.ReactNode;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  threshold?: number;
}

export function InfiniteScroll({
  children,
  onLoadMore,
  hasMore,
  isLoading,
  threshold = 100
}: InfiniteScrollProps) {
  const observer = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || isLoading) return;

    observer.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: `${threshold}px` }
    );

    if (sentinelRef.current) {
      observer.current.observe(sentinelRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [hasMore, isLoading, onLoadMore, threshold]);

  return (
    <div>
      {children}
      
      <div ref={sentinelRef} className="h-px" />
      
      {isLoading && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}
      
      {!hasMore && !isLoading && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          You&#39;ve reached the end
        </div>
      )}
    </div>
  );
}