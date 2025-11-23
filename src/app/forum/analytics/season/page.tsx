'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { SeasonPosts } from '@/components/forum/posts';

export default function SeasonAnalyticsPage() {
  const [selectedSeason, setSelectedSeason] = useState<'spring' | 'summer' | 'autumn' | 'winter'>('spring');
  
  return (
    <div className="container py-8">
      <PageHeader 
        title="Seasonal Analytics" 
        description="Analyze forum activity patterns throughout the seasons."
      />
      
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={selectedSeason === 'spring' ? 'default' : 'outline'} 
            onClick={() => setSelectedSeason('spring')}
          >
            Spring
          </Button>
          <Button 
            variant={selectedSeason === 'summer' ? 'default' : 'outline'} 
            onClick={() => setSelectedSeason('summer')}
          >
            Summer
          </Button>
          <Button 
            variant={selectedSeason === 'autumn' ? 'default' : 'outline'} 
            onClick={() => setSelectedSeason('autumn')}
          >
            Autumn
          </Button>
          <Button 
            variant={selectedSeason === 'winter' ? 'default' : 'outline'} 
            onClick={() => setSelectedSeason('winter')}
          >
            Winter
          </Button>
        </div>
      </div>
      
      <SeasonPosts season={selectedSeason} />
    </div>
  );
}