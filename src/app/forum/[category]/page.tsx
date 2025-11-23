'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';
import { ForumPostCard } from '@/components/forum/PostCard';
import { ForumFilters } from '@/components/forum/utilities';
import { getForumPostsByCategory } from '@/lib/services/forum';
import { Skeleton } from '@/components/ui/skeleton';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ResultNotFoundCard } from '@/components/ui/ResultNotFoundCard';

export default function CategoryPage() {
  const rawPathname = usePathname();
  const category = rawPathname?.split('/')?.[2] ?? ''; // Safely extract category
  
  const [posts, setPosts] = useState<React.ComponentProps<typeof ForumPostCard>['post'][]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    sort: 'createdAt' as 'createdAt' | 'upvotes' | 'replies',
    filter: 'all' as 'all' | 'unanswered' | 'trending' | 'recent',
    search: ''
  });
  
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getForumPostsByCategory(category, {
        sort: filters.sort,
        filter: filters.filter,
        ...(searchQuery && { search: searchQuery })
      });
      setPosts(data.posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, [category, filters, searchQuery]);
  
  useEffect(() => {
    if (category) {
      fetchPosts();
    }
  }, [category, filters, searchQuery, fetchPosts]);
  
  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };
  
  return (
    <div className="container py-8">
      <PageHeader 
        title={category ? `${category.charAt(0).toUpperCase() + category.slice(1)} Forum` : 'Forum Category'} 
        description={`Discuss topics related to ${category || 'this condition'} with patients and researchers.`}
      />
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-3/4">
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <Link href="/forum/create" aria-label="Create a new forum post">
              <Button>New Post</Button>
            </Link>
          </div>
          
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {posts.length === 0 ? (
                <ResultNotFoundCard 
                  title="No posts in this category"
                  description="Try changing filters or creating a new post to start the discussion."
                  actionHref="/forum/create"
                  actionLabel="Create Post"
                />
              ) : (
                posts.map((post) => (
                  <ForumPostCard key={post._id} post={post} />
                ))
              )}
            </div>
          )}
        </div>
        
        <div className="lg:w-1/4">
          <ForumFilters onFilterChange={handleFilterChange} />
        </div>
      </div>
    </div>
  );
}