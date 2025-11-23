'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, BookOpen, FlaskConical } from 'lucide-react';

interface SearchTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function SearchTabs({ activeTab, onTabChange }: SearchTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList>
        <TabsTrigger value="all" className="flex items-center">
          All
        </TabsTrigger>
        <TabsTrigger value="researchers" className="flex items-center">
          <User className="mr-2 h-4 w-4" />
          Researchers
        </TabsTrigger>
        <TabsTrigger value="patients" className="flex items-center">
          <User className="mr-2 h-4 w-4" />
          Patients
        </TabsTrigger>
        <TabsTrigger value="publications" className="flex items-center">
          <BookOpen className="mr-2 h-4 w-4" />
          Publications
        </TabsTrigger>
        <TabsTrigger value="trials" className="flex items-center">
          <FlaskConical className="mr-2 h-4 w-4" />
          Trials
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}