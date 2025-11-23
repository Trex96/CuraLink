'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdvancedFilteredPosts } from '@/components/forum/posts';

export default function AdvancedSearchPage() {
  const [filters, setFilters] = useState({
    categories: [] as string[],
    tags: [] as string[],
    authorRole: '',
    isVerified: undefined as boolean | undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc'
  });
  
  const [appliedFilters, setAppliedFilters] = useState({});
  
  const handleCategoryChange = (category: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      categories: checked 
        ? [...prev.categories, category] 
        : prev.categories.filter(c => c !== category)
    }));
  };
  
  const handleTagChange = (tag: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      tags: checked 
        ? [...prev.tags, tag] 
        : prev.tags.filter(t => t !== tag)
    }));
  };
  
  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters });
  };
  
  const handleResetFilters = () => {
    setFilters({
      categories: [],
      tags: [],
      authorRole: '',
      isVerified: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setAppliedFilters({});
  };
  
  return (
    <div className="container py-8">
      <PageHeader 
        title="Advanced Forum Search" 
        description="Filter and search forum posts with detailed criteria."
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-medium mb-4">Filters</h3>
            
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium mb-2 block">Categories</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="diabetes" 
                      checked={filters.categories.includes('diabetes')}
                      onCheckedChange={(checked) => handleCategoryChange('diabetes', !!checked)}
                    />
                    <label htmlFor="diabetes" className="text-sm">Diabetes</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="hypertension" 
                      checked={filters.categories.includes('hypertension')}
                      onCheckedChange={(checked) => handleCategoryChange('hypertension', !!checked)}
                    />
                    <label htmlFor="hypertension" className="text-sm">Hypertension</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="cardiovascular" 
                      checked={filters.categories.includes('cardiovascular')}
                      onCheckedChange={(checked) => handleCategoryChange('cardiovascular', !!checked)}
                    />
                    <label htmlFor="cardiovascular" className="text-sm">Cardiovascular</label>
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-2 block">Tags</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="treatment" 
                      checked={filters.tags.includes('treatment')}
                      onCheckedChange={(checked) => handleTagChange('treatment', !!checked)}
                    />
                    <label htmlFor="treatment" className="text-sm">Treatment</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="symptoms" 
                      checked={filters.tags.includes('symptoms')}
                      onCheckedChange={(checked) => handleTagChange('symptoms', !!checked)}
                    />
                    <label htmlFor="symptoms" className="text-sm">Symptoms</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="diet" 
                      checked={filters.tags.includes('diet')}
                      onCheckedChange={(checked) => handleTagChange('diet', !!checked)}
                    />
                    <label htmlFor="diet" className="text-sm">Diet</label>
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-2 block">Author Role</Label>
                <Select 
                  value={filters.authorRole} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, authorRole: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Role</SelectItem>
                    <SelectItem value="patient">Patient</SelectItem>
                    <SelectItem value="researcher">Researcher</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-2 block">Verification Status</Label>
                <Select 
                  value={filters.isVerified === undefined ? '' : filters.isVerified.toString()} 
                  onValueChange={(value) => setFilters(prev => ({ 
                    ...prev, 
                    isVerified: value === '' ? undefined : value === 'true' 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Status</SelectItem>
                    <SelectItem value="true">Verified</SelectItem>
                    <SelectItem value="false">Unverified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-2 block">Sort By</Label>
                <Select 
                  value={filters.sortBy} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Date</SelectItem>
                    <SelectItem value="upvotes">Upvotes</SelectItem>
                    <SelectItem value="replyCount">Replies</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-2 block">Sort Order</Label>
                <Select 
                  value={filters.sortOrder} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, sortOrder: value as 'asc' | 'desc' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Descending</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleApplyFilters} className="flex-1">
                  Apply Filters
                </Button>
                <Button variant="outline" onClick={handleResetFilters}>
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-3">
          <AdvancedFilteredPosts filters={appliedFilters} />
        </div>
      </div>
    </div>
  );
}