'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { DashboardSectionHeader } from '@/components/dashboard/DashboardSectionHeader';
import { DashboardGridLayout } from '@/components/dashboard/DashboardGridLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { SectionCard } from '@/components/dashboard/SectionCard';
import { ProgressBar } from '@/components/dashboard/ProgressBar';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { UpcomingEvents } from '@/components/dashboard/UpcomingEvents';
import { RecommendationCard } from '@/components/dashboard/RecommendationCard';
import { MetricChart } from '@/components/dashboard/MetricChart';
import { BookOpen, Eye, FlaskConical, MessageCircle, Users } from 'lucide-react';

export default function DemoDashboardPage() {
  const stats = [
    { title: "Publications", value: "24", description: "+12% from last month", icon: <BookOpen className="h-4 w-4" /> },
    { title: "Connections", value: "142", description: "+8% from last month", icon: <Users className="h-4 w-4" /> },
    { title: "Trial Views", value: "1,284", description: "+18% from last month", icon: <FlaskConical className="h-4 w-4" /> },
    { title: "Messages", value: "56", description: "+3 new today", icon: <MessageCircle className="h-4 w-4" /> }
  ];

  const quickActions = [
    { id: "1", title: "Add Publication", description: "Import new research", icon: <BookOpen className="h-5 w-5" />, onClick: () => console.log("Add Publication") },
    { id: "2", title: "Create Trial", description: "Start new study", icon: <FlaskConical className="h-5 w-5" />, onClick: () => console.log("Create Trial") },
    { id: "3", title: "Connect", description: "Find researchers", icon: <Users className="h-5 w-5" />, onClick: () => console.log("Connect") },
    { id: "4", title: "Post Update", description: "Share progress", icon: <MessageCircle className="h-5 w-5" />, onClick: () => console.log("Post Update") }
  ];

  // Use fixed dates to avoid impure function errors
  const baseDate = useMemo(() => new Date('2023-01-01T12:00:00Z'), []);

  const activities = useMemo(() => {
    const oneHourAgo = new Date(baseDate.getTime() - 3600000);
    const twoHoursAgo = new Date(baseDate.getTime() - 7200000);
    const oneDayAgo = new Date(baseDate.getTime() - 86400000);
    const twoDaysAgo = new Date(baseDate.getTime() - 172800000);
    
    return [
      { id: "1", title: "New connection", description: "Dr. Jane Smith connected with you", timestamp: oneHourAgo, icon: <Users className="h-4 w-4" /> },
      { id: "2", title: "Publication viewed", description: "Your paper was viewed 24 times", timestamp: twoHoursAgo, icon: <Eye className="h-4 w-4" /> },
      { id: "3", title: "Trial update", description: "Patient recruitment is 75% complete", timestamp: oneDayAgo, icon: <FlaskConical className="h-4 w-4" /> },
      { id: "4", title: "New message", description: "You have 3 unread messages", timestamp: twoDaysAgo, icon: <MessageCircle className="h-4 w-4" /> }
    ];
  }, [baseDate]);

  const events = useMemo(() => {
    const oneDayFuture = new Date(baseDate.getTime() + 86400000);
    const threeDaysFuture = new Date(baseDate.getTime() + 259200000);
    const sevenDaysFuture = new Date(baseDate.getTime() + 604800000);
    
    return [
      { id: "1", title: "IRB Meeting", date: oneDayFuture, location: "Conference Room A", description: "Review of trial protocols", type: "meeting" as const },
      { id: "2", title: "Patient Recruitment Deadline", date: threeDaysFuture, description: "Complete enrollment for Phase 2", type: "deadline" as const },
      { id: "3", title: "Conference Presentation", date: sevenDaysFuture, location: "Boston Convention Center", description: "Presenting findings on cancer research", type: "meeting" as const }
    ];
  }, [baseDate]);

  const recommendations = [
    { id: "1", title: "Dr. Michael Chen", description: "Oncology researcher at Johns Hopkins", matchPercentage: 87, type: "researcher" as const, icon: <Users className="h-4 w-4" />, onClick: () => console.log("View researcher") },
    { id: "2", title: "Novel Immunotherapy Approaches", description: "Recent publication in Nature Medicine", matchPercentage: 92, type: "publication" as const, icon: <BookOpen className="h-4 w-4" />, onClick: () => console.log("View publication") },
    { id: "3", title: "CAR-T Cell Therapy Trial", description: "Phase 3 trial for blood cancers", matchPercentage: 78, type: "trial" as const, icon: <FlaskConical className="h-4 w-4" />, onClick: () => console.log("View trial") }
  ];

  const chartData = [
    { name: 'Jan', views: 400, connections: 240 },
    { name: 'Feb', views: 300, connections: 139 },
    { name: 'Mar', views: 200, connections: 980 },
    { name: 'Apr', views: 278, connections: 390 },
    { name: 'May', views: 189, connections: 480 },
  ];

  return (
    <div className="container py-8">
      <DashboardSectionHeader 
        title="Dashboard Demo" 
        description="Showcasing reusable dashboard components"
        action={<Button>New Report</Button>}
      />
      
      <DashboardGridLayout>
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </DashboardGridLayout>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <SectionCard 
            title="Profile Completion" 
            description="Complete your profile to get more connections"
            action={<Button size="sm">Edit Profile</Button>}
          >
            <div className="space-y-4">
              <ProgressBar value={75} label="Basic Information" description="Name, bio, institution" />
              <ProgressBar value={60} label="Research Interests" description="Specialties and expertise" />
              <ProgressBar value={90} label="Publications" description="Imported research papers" />
              <ProgressBar value={40} label="Trial Participation" description="Active and past trials" />
            </div>
          </SectionCard>
        </div>
        
        <div>
          <QuickActions actions={quickActions} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <ActivityFeed activities={activities} />
        <UpcomingEvents events={events} onViewAll={() => console.log("View all events")} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <RecommendationCard 
          recommendations={recommendations} 
          onViewAll={() => console.log("View all recommendations")}
        />
        <MetricChart 
          data={chartData}
          type="line"
          dataKey="views"
          title="Profile Analytics"
          description="Views and connections over time"
        />
      </div>
    </div>
  );
}