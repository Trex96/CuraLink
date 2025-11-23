'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { HolidayPosts } from '@/components/forum/posts';

export default function HolidayAnalyticsPage() {
  const [selectedHoliday, setSelectedHoliday] = useState<'new-year' | 'valentines' | 'easter' | 'independence' | 'halloween' | 'thanksgiving' | 'christmas'>('new-year');
  
  return (
    <div className="container py-8">
      <PageHeader 
        title="Holiday Analytics" 
        description="Analyze forum activity patterns during holidays."
      />
      
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={selectedHoliday === 'new-year' ? 'default' : 'outline'} 
            onClick={() => setSelectedHoliday('new-year')}
          >
            New Year&apos;s Day
          </Button>
          <Button 
            variant={selectedHoliday === 'valentines' ? 'default' : 'outline'} 
            onClick={() => setSelectedHoliday('valentines')}
          >
            Valentine&apos;s Day
          </Button>
          <Button 
            variant={selectedHoliday === 'easter' ? 'default' : 'outline'} 
            onClick={() => setSelectedHoliday('easter')}
          >
            Easter
          </Button>
          <Button 
            variant={selectedHoliday === 'independence' ? 'default' : 'outline'} 
            onClick={() => setSelectedHoliday('independence')}
          >
            Independence Day
          </Button>
          <Button 
            variant={selectedHoliday === 'halloween' ? 'default' : 'outline'} 
            onClick={() => setSelectedHoliday('halloween')}
          >
            Halloween
          </Button>
          <Button 
            variant={selectedHoliday === 'thanksgiving' ? 'default' : 'outline'} 
            onClick={() => setSelectedHoliday('thanksgiving')}
          >
            Thanksgiving
          </Button>
          <Button 
            variant={selectedHoliday === 'christmas' ? 'default' : 'outline'} 
            onClick={() => setSelectedHoliday('christmas')}
          >
            Christmas
          </Button>
        </div>
      </div>
      
      <HolidayPosts holiday={selectedHoliday} />
    </div>
  );
}