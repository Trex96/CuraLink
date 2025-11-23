'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, X, Loader2 } from 'lucide-react';
import { useLocation } from '@/context/LocationContext';
import { toast } from 'sonner';

interface LocationPickerProps {
  value?: { lat: number; lng: number; address?: string };
  onChange?: (location: { lat: number; lng: number; address?: string } | null) => void;
  placeholder?: string;
}

export function LocationPicker({ value, onChange, placeholder = 'Enter location...' }: LocationPickerProps) {
  const [inputValue, setInputValue] = useState(value?.address || '');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { getLocation, location: userLocation } = useLocation();

  // Common locations for suggestions
  const commonLocations = [
    'New York, NY',
    'Los Angeles, CA',
    'Chicago, IL',
    'Houston, TX',
    'Phoenix, AZ',
    'Philadelphia, PA',
    'San Antonio, TX',
    'San Diego, CA',
    'Dallas, TX',
    'San Jose, CA'
  ];

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (onChange) {
      onChange(null);
    }
    
    if (value.length > 2) {
      // Show suggestions
      const filtered = commonLocations.filter(location => 
        location.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    handleGeocode(suggestion);
  };

  // Handle geocode
  const handleGeocode = async (addressToGeocode?: string) => {
    const address = addressToGeocode || inputValue;
    if (!address) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Geocoding failed');
      }
      
      const coordinates = await response.json();
      
      if (onChange) {
        onChange({
          ...coordinates,
          address
        });
      }
    } catch (error: unknown) {
      console.error('Geocoding error:', error);
      toast.error('Location Error', {
        description: (error as Error).message || 'Failed to geocode address'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Use current location
  const handleUseCurrentLocation = async () => {
    try {
      await getLocation();
      if (userLocation && onChange) {
        onChange(userLocation);
        setInputValue(userLocation.address || '');
      }
    } catch (error: unknown) {
      console.error('Failed to get current location:', error);
      toast.error('Location Error', {
        description: (error as Error).message || 'Failed to get current location'
      });
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleGeocode();
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update input value when value prop changes
  useEffect(() => {
    if (value?.address && value.address !== inputValue) {
      setInputValue(value.address);
    }
  }, [value, inputValue]);

  return (
    <div className="relative" ref={inputRef}>
      <form onSubmit={handleSubmit} className="relative">
        <Input
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="pr-20"
        />
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-8 top-1/2 -translate-y-1/2"
            onClick={() => {
              setInputValue('');
              if (onChange) onChange(null);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MapPin className="h-4 w-4" />
          )}
        </Button>
      </form>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md">
          <div className="max-h-60 overflow-auto py-1">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                className="w-full px-4 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-2 flex space-x-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleUseCurrentLocation}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <MapPin className="mr-2 h-4 w-4" />
          )}
          Use Current Location
        </Button>
      </div>
    </div>
  );
}