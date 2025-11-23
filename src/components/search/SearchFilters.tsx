'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LocationPicker } from '@/components/location-picker';
import { ChevronDown, ChevronUp, MapPin, Calendar, FlaskConical, Building2, GraduationCap, Stethoscope } from 'lucide-react';

interface SearchFiltersProps {
  activeTab: string;
  onFiltersChange: (filters: {
    location?: { lat: number; lng: number; address?: string };
    radius?: number;
    sortBy?: string;
    dateRange?: { from?: string; to?: string };
    status?: string[];
    conditions?: string[];
    institution?: string;
    expertise?: string[];
  }) => void;
}

export function SearchFilters({ activeTab, onFiltersChange }: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null);
  const [radius, setRadius] = useState<number[]>([50]);
  const [sortBy, setSortBy] = useState('relevance');
  const [dateRange, setDateRange] = useState<{ from?: string; to?: string }>({});
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);
  const [institution, setInstitution] = useState('');
  const [expertise, setExpertise] = useState<string[]>([]);

  // Reset filters when tab changes
  useEffect(() => {
    // Optional: clear filters on tab change or keep common ones?
    // For now, we keep common ones (location) but maybe reset specific ones.
    // Let's keep it simple and not auto-reset for now, or maybe just specific ones.
  }, [activeTab]);

  const getFilters = () => ({
    location: location || undefined,
    radius: radius[0],
    sortBy,
    dateRange,
    status: selectedStatus,
    conditions,
    institution: institution || undefined,
    expertise,
  });

  const updateFilters = (newFilters: Partial<ReturnType<typeof getFilters>>) => {
    onFiltersChange({ ...getFilters(), ...newFilters });
  };

  const handleLocationChange = (loc: { lat: number; lng: number; address?: string } | null) => {
    setLocation(loc);
    updateFilters({ location: loc || undefined });
  };

  const handleRadiusChange = (value: number[]) => {
    setRadius(value);
    updateFilters({ radius: value[0] });
  };

  const handleSortByChange = (value: string) => {
    setSortBy(value);
    updateFilters({ sortBy: value });
  };

  const handleDateRangeChange = (field: 'from' | 'to', value: string) => {
    const newDateRange = { ...dateRange, [field]: value };
    setDateRange(newDateRange);
    updateFilters({ dateRange: newDateRange });
  };

  const handleStatusChange = (status: string, checked: boolean) => {
    const newStatus = checked
      ? [...selectedStatus, status]
      : selectedStatus.filter(s => s !== status);
    setSelectedStatus(newStatus);
    updateFilters({ status: newStatus });
  };

  const addCondition = (condition: string) => {
    if (condition && !conditions.includes(condition)) {
      const newConditions = [...conditions, condition];
      setConditions(newConditions);
      updateFilters({ conditions: newConditions });
    }
  };

  const removeCondition = (condition: string) => {
    const newConditions = conditions.filter(c => c !== condition);
    setConditions(newConditions);
    updateFilters({ conditions: newConditions });
  };

  const addExpertise = (item: string) => {
    if (item && !expertise.includes(item)) {
      const newExpertise = [...expertise, item];
      setExpertise(newExpertise);
      updateFilters({ expertise: newExpertise });
    }
  };

  const removeExpertise = (item: string) => {
    const newExpertise = expertise.filter(i => i !== item);
    setExpertise(newExpertise);
    updateFilters({ expertise: newExpertise });
  };

  const handleInstitutionChange = (value: string) => {
    setInstitution(value);
    // Debounce this in parent or here? For now, update on change might be too frequent.
    // Let's update on blur or have an apply button.
    // But existing pattern updates immediately. Let's stick to that for consistency, 
    // but maybe for text input it's better to wait for "Apply".
    // The "Apply Filters" button at the bottom suggests we might not need immediate updates?
    // Actually, the previous code called onFiltersChange on every change.
    updateFilters({ institution: value });
  };

  const clearFilters = () => {
    setLocation(null);
    setRadius([50]);
    setSortBy('relevance');
    setDateRange({});
    setSelectedStatus([]);
    setConditions([]);
    setInstitution('');
    setExpertise([]);
    onFiltersChange({});
  };

  const trialStatuses = [
    'Recruiting',
    'Active, not recruiting',
    'Completed',
    'Suspended',
    'Terminated',
    'Withdrawn',
    'Unknown status'
  ];

  return (
    <div className="border rounded-lg bg-card">
      <Button
        variant="ghost"
        className="w-full justify-between p-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span>Filters {activeTab !== 'all' && `(${activeTab})`}</span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>

      {isExpanded && (
        <div className="p-4 border-t space-y-6">
          {/* Common: Location Filter */}
          <div>
            <Label className="flex items-center">
              <MapPin className="mr-2 h-4 w-4" />
              Location
            </Label>
            <div className="mt-2">
              <LocationPicker
                value={location || undefined}
                onChange={handleLocationChange}
                placeholder="Search location..."
              />
              {location && (
                <div className="mt-2">
                  <Label>Radius (miles)</Label>
                  <Slider
                    value={radius}
                    onValueChange={handleRadiusChange}
                    max={500}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>1 mile</span>
                    <span>{radius[0]} miles</span>
                    <span>500 miles</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Common: Sort By */}
          <div>
            <Label>Sort By</Label>
            <Select value={sortBy} onValueChange={handleSortByChange}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="distance">Distance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Researcher Specific */}
          {(activeTab === 'researchers' || activeTab === 'all') && (
            <>
              <div>
                <Label className="flex items-center">
                  <Building2 className="mr-2 h-4 w-4" />
                  Institution
                </Label>
                <Input
                  value={institution}
                  onChange={(e) => handleInstitutionChange(e.target.value)}
                  placeholder="e.g. Harvard Medical School"
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="flex items-center">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Expertise
                </Label>
                <div className="mt-2 flex">
                  <Input
                    placeholder="Add expertise"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addExpertise((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                    className="flex-1"
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {expertise.map((item, index) => (
                    <div key={index} className="flex items-center rounded-full bg-secondary px-3 py-1 text-sm">
                      {item}
                      <button onClick={() => removeExpertise(item)} className="ml-2 text-muted-foreground hover:text-foreground">×</button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Patient Specific */}
          {(activeTab === 'patients' || activeTab === 'trials' || activeTab === 'all') && (
            <div>
              <Label className="flex items-center">
                <Stethoscope className="mr-2 h-4 w-4" />
                Conditions
              </Label>
              <div className="mt-2 flex">
                <Input
                  placeholder="Add condition"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addCondition((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                  className="flex-1"
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {conditions.map((condition, index) => (
                  <div key={index} className="flex items-center rounded-full bg-secondary px-3 py-1 text-sm">
                    {condition}
                    <button onClick={() => removeCondition(condition)} className="ml-2 text-muted-foreground hover:text-foreground">×</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trial Specific */}
          {(activeTab === 'trials') && (
            <div>
              <Label className="flex items-center">
                <FlaskConical className="mr-2 h-4 w-4" />
                Trial Status
              </Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {trialStatuses.map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status}`}
                      checked={selectedStatus.includes(status)}
                      onCheckedChange={(checked) => handleStatusChange(status, !!checked)}
                    />
                    <Label htmlFor={`status-${status}`} className="text-sm">
                      {status}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Publication Specific */}
          {(activeTab === 'publications') && (
            <div>
              <Label className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                Date Range
              </Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <Label className="text-xs">From</Label>
                  <Input
                    type="date"
                    value={dateRange.from || ''}
                    onChange={(e) => handleDateRangeChange('from', e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs">To</Label>
                  <Input
                    type="date"
                    value={dateRange.to || ''}
                    onChange={(e) => handleDateRangeChange('to', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
            <Button onClick={() => setIsExpanded(false)}>
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}