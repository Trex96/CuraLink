'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ForumFiltersProps {
  onFilterChange: (filters: {
    sort: 'createdAt' | 'upvotes' | 'replies';
    filter: 'all' | 'unanswered' | 'trending' | 'recent';
    search: string;
  }) => void;
}

export function ForumFilters({ onFilterChange }: ForumFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label>Search</Label>
          <Input 
            placeholder="Search posts..." 
            onChange={(e) => onFilterChange({
              sort: 'createdAt',
              filter: 'all',
              search: e.target.value
            })}
          />
        </div>
        
        <div>
          <Label>Sort By</Label>
          <Select 
            defaultValue="createdAt" 
            onValueChange={(value) => onFilterChange({
              sort: value as 'createdAt' | 'upvotes' | 'replies',
              filter: 'all',
              search: ''
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Most Recent</SelectItem>
              <SelectItem value="upvotes">Most Upvoted</SelectItem>
              <SelectItem value="replies">Most Replies</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Filter By</Label>
          <Select 
            defaultValue="all" 
            onValueChange={(value) => onFilterChange({
              sort: 'createdAt',
              filter: value as 'all' | 'unanswered' | 'trending' | 'recent',
              search: ''
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Posts</SelectItem>
              <SelectItem value="unanswered">Unanswered</SelectItem>
              <SelectItem value="trending">Trending</SelectItem>
              <SelectItem value="recent">Recent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button variant="outline" className="w-full" onClick={() => onFilterChange({
          sort: 'createdAt',
          filter: 'all',
          search: ''
        })}>
          Reset Filters
        </Button>
      </CardContent>
    </Card>
  );
}