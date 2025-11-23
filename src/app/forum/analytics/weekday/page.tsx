'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { DayOfWeekPosts } from '@/components/forum/posts';

export default function WeekdayAnalyticsPage() {
  const [selectedDay, setSelectedDay] = useState<'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'>('monday');
  
  return (
    <div className="container py-8">
      <PageHeader 
        title="Weekday Analytics" 
        description="Analyze forum activity patterns throughout the week."
      />
      
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={selectedDay === 'sunday' ? 'default' : 'outline'} 
            onClick={() => setSelectedDay('sunday')}
          >
            Sunday
          </Button>
          <Button 
            variant={selectedDay === 'monday' ? 'default' : 'outline'} 
            onClick={() => setSelectedDay('monday')}
          >
            Monday
          </Button>
          <Button 
            variant={selectedDay === 'tuesday' ? 'default' : 'outline'} 
            onClick={() => setSelectedDay('tuesday')}
          >
            Tuesday
          </Button>
          <Button 
            variant={selectedDay === 'wednesday' ? 'default' : 'outline'} 
            onClick={() => setSelectedDay('wednesday')}
          >
            Wednesday
          </Button>
          <Button 
            variant={selectedDay === 'thursday' ? 'default' : 'outline'} 
            onClick={() => setSelectedDay('thursday')}
          >
            Thursday
          </Button>
          <Button 
            variant={selectedDay === 'friday' ? 'default' : 'outline'} 
            onClick={() => setSelectedDay('friday')}
          >
            Friday
          </Button>
          <Button 
            variant={selectedDay === 'saturday' ? 'default' : 'outline'} 
            onClick={() => setSelectedDay('saturday')}
          >
            Saturday
          </Button>
        </div>
      </div>
      
      <DayOfWeekPosts day={selectedDay} />
    </div>
  );
}