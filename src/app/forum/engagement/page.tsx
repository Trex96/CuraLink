'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EngagementMetricPosts } from '@/components/forum/posts';

export default function EngagementMetricsPage() {
  const [metrics, setMetrics] = useState({
    minReplies: 5,
    minUpvotes: 10,
    minViews: 100
  });
  
  const [appliedMetrics, setAppliedMetrics] = useState({
    minReplies: 5,
    minUpvotes: 10,
    minViews: 100
  });
  
  const handleApplyMetrics = () => {
    setAppliedMetrics({ ...metrics });
  };
  
  const handleResetMetrics = () => {
    setMetrics({
      minReplies: 0,
      minUpvotes: 0,
      minViews: 0
    });
    setAppliedMetrics({
      minReplies: 0,
      minUpvotes: 0,
      minViews: 0
    });
  };
  
  return (
    <div className="container py-8">
      <PageHeader 
        title="Engagement Metrics" 
        description="Discover the most engaging discussions in our community."
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-medium mb-4">Engagement Filters</h3>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Minimum Replies</Label>
                <Input 
                  type="number" 
                  value={metrics.minReplies} 
                  onChange={(e) => setMetrics(prev => ({ ...prev, minReplies: parseInt(e.target.value) || 0 }))}
                  min="0"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-2 block">Minimum Upvotes</Label>
                <Input 
                  type="number" 
                  value={metrics.minUpvotes} 
                  onChange={(e) => setMetrics(prev => ({ ...prev, minUpvotes: parseInt(e.target.value) || 0 }))}
                  min="0"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-2 block">Minimum Views</Label>
                <Input 
                  type="number" 
                  value={metrics.minViews} 
                  onChange={(e) => setMetrics(prev => ({ ...prev, minViews: parseInt(e.target.value) || 0 }))}
                  min="0"
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleApplyMetrics} className="flex-1">
                  Apply Filters
                </Button>
                <Button variant="outline" onClick={handleResetMetrics}>
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-3">
          <EngagementMetricPosts metrics={appliedMetrics} />
        </div>
      </div>
    </div>
  );
}