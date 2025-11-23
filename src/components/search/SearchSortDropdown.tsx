'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SortAsc } from 'lucide-react';

interface SearchSortDropdownProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function SearchSortDropdown({ value, onValueChange }: SearchSortDropdownProps) {
  return (
    <div className="flex items-center space-x-2">
      <SortAsc className="h-4 w-4 text-muted-foreground" />
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="relevance">Sort by Relevance</SelectItem>
          <SelectItem value="date-newest">Date (Newest First)</SelectItem>
          <SelectItem value="date-oldest">Date (Oldest First)</SelectItem>
          <SelectItem value="distance">Distance</SelectItem>
          <SelectItem value="match-highest">Match % (Highest)</SelectItem>
          <SelectItem value="match-lowest">Match % (Lowest)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}