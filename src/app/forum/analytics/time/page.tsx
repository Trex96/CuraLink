'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { TimeOfDayPosts } from '@/components/forum/posts';

export default function TimeBasedAnalyticsPage() {
  const [selectedTime, setSelectedTime] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning');
  
  return (
    <div className="container py-8">
      <PageHeader 
        title="Time-Based Analytics" 
        description="Analyze forum activity patterns throughout the day."
      />
      
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={selectedTime === 'morning' ? 'default' : 'outline'} 
            onClick={() => setSelectedTime('morning')}
          >
            Morning (6 AM - 12 PM)
          </Button>
          <Button 
            variant={selectedTime === 'afternoon' ? 'default' : 'outline'} 
            onClick={() => setSelectedTime('afternoon')}
          >
            Afternoon (12 PM - 6 PM)
          </Button>
          <Button 
            variant={selectedTime === 'evening' ? 'default' : 'outline'} 
            onClick={() => setSelectedTime('evening')}
          >
            Evening (6 PM - 12 AM)
          </Button>
          <Button 
            variant={selectedTime === 'night' ? 'default' : 'outline'} 
            onClick={() => setSelectedTime('night')}
          >
            Night (12 AM - 6 AM)
          </Button>
        </div>
      </div>
      
      <TimeOfDayPosts time={selectedTime} />
    </div>
  );
}