'use client';

import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ForumAnalyticsPage() {
  return (
    <div className="container py-8">
      <PageHeader 
        title="Forum Analytics Dashboard" 
        description="Explore comprehensive analytics and insights about forum activity."
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Time-Based Analytics</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Analyze forum activity patterns throughout the day, week, and year.
          </p>
          <Link href="/forum/analytics/time">
            <Button variant="outline">View Time Analytics</Button>
          </Link>
        </div>
        
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Weekday Analytics</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Discover which days of the week see the most forum activity.
          </p>
          <Link href="/forum/analytics/weekday">
            <Button variant="outline">View Weekday Analytics</Button>
          </Link>
        </div>
        
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Monthly Analytics</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Explore forum activity patterns throughout the year by month.
          </p>
          <Link href="/forum/analytics/month">
            <Button variant="outline">View Monthly Analytics</Button>
          </Link>
        </div>
        
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Yearly Analytics</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Analyze long-term forum activity trends over multiple years.
          </p>
          <Link href="/forum/analytics/year">
            <Button variant="outline">View Yearly Analytics</Button>
          </Link>
        </div>
        
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Seasonal Analytics</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Understand how forum activity changes with the seasons.
          </p>
          <Link href="/forum/analytics/season">
            <Button variant="outline">View Seasonal Analytics</Button>
          </Link>
        </div>
        
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Holiday Analytics</h3>
          <p className="text-muted-foreground text-sm mb-4">
            See how forum activity is affected during major holidays.
          </p>
          <Link href="/forum/analytics/holiday">
            <Button variant="outline">View Holiday Analytics</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}