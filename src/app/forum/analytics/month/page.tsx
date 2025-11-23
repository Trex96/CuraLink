'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { MonthPosts } from '@/components/forum/posts';

export default function MonthAnalyticsPage() {
  const [selectedMonth, setSelectedMonth] = useState<'january' | 'february' | 'march' | 'april' | 'may' | 'june' | 'july' | 'august' | 'september' | 'october' | 'november' | 'december'>('january');
  
  return (
    <div className="container py-8">
      <PageHeader 
        title="Monthly Analytics" 
        description="Analyze forum activity patterns throughout the year."
      />
      
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={selectedMonth === 'january' ? 'default' : 'outline'} 
            onClick={() => setSelectedMonth('january')}
          >
            January
          </Button>
          <Button 
            variant={selectedMonth === 'february' ? 'default' : 'outline'} 
            onClick={() => setSelectedMonth('february')}
          >
            February
          </Button>
          <Button 
            variant={selectedMonth === 'march' ? 'default' : 'outline'} 
            onClick={() => setSelectedMonth('march')}
          >
            March
          </Button>
          <Button 
            variant={selectedMonth === 'april' ? 'default' : 'outline'} 
            onClick={() => setSelectedMonth('april')}
          >
            April
          </Button>
          <Button 
            variant={selectedMonth === 'may' ? 'default' : 'outline'} 
            onClick={() => setSelectedMonth('may')}
          >
            May
          </Button>
          <Button 
            variant={selectedMonth === 'june' ? 'default' : 'outline'} 
            onClick={() => setSelectedMonth('june')}
          >
            June
          </Button>
          <Button 
            variant={selectedMonth === 'july' ? 'default' : 'outline'} 
            onClick={() => setSelectedMonth('july')}
          >
            July
          </Button>
          <Button 
            variant={selectedMonth === 'august' ? 'default' : 'outline'} 
            onClick={() => setSelectedMonth('august')}
          >
            August
          </Button>
          <Button 
            variant={selectedMonth === 'september' ? 'default' : 'outline'} 
            onClick={() => setSelectedMonth('september')}
          >
            September
          </Button>
          <Button 
            variant={selectedMonth === 'october' ? 'default' : 'outline'} 
            onClick={() => setSelectedMonth('october')}
          >
            October
          </Button>
          <Button 
            variant={selectedMonth === 'november' ? 'default' : 'outline'} 
            onClick={() => setSelectedMonth('november')}
          >
            November
          </Button>
          <Button 
            variant={selectedMonth === 'december' ? 'default' : 'outline'} 
            onClick={() => setSelectedMonth('december')}
          >
            December
          </Button>
        </div>
      </div>
      
      <MonthPosts month={selectedMonth} />
    </div>
  );
}