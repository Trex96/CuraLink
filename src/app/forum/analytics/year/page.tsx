'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { YearPosts } from '@/components/forum/posts';

export default function YearAnalyticsPage() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  
  return (
    <div className="container py-8">
      <PageHeader 
        title="Yearly Analytics" 
        description="Analyze forum activity patterns over the years."
      />
      
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Year:</span>
          <Input 
            type="number" 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value) || currentYear)}
            className="w-24"
            min="2020"
            max={currentYear}
          />
        </div>
        <Button 
          variant="outline" 
          onClick={() => setSelectedYear(currentYear)}
        >
          Current Year
        </Button>
      </div>
      
      <YearPosts year={selectedYear} />
    </div>
  );
}