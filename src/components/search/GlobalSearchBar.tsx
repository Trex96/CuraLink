'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface SearchResult {
  id: string;
  title: string;
  type: 'researcher' | 'publication' | 'trial';
  matchPercentage?: number;
}

interface RecentSearch {
  id: string;
  query: string;
  timestamp: number;
}

const GlobalSearchBar = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse recent searches', e);
      }
    }
  }, []);

  // Save recent searches to localStorage
  useEffect(() => {
    if (recentSearches.length > 0) {
      localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    }
  }, [recentSearches]);

  // Fetch search suggestions
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, this would call an API endpoint
        // For now, we'll simulate with mock data
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const mockSuggestions: SearchResult[] = [
          { id: '1', title: `Researcher: ${query}`, type: 'researcher', matchPercentage: 85 },
          { id: '2', title: `Publication: ${query}`, type: 'publication', matchPercentage: 72 },
          { id: '3', title: `Trial: ${query}`, type: 'trial', matchPercentage: 68 },
        ];
        
        setSuggestions(mockSuggestions);
      } catch (error) {
        console.error('Failed to fetch suggestions', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSearch = (searchQuery: string = query) => {
    if (searchQuery.trim()) {
      // Add to recent searches
      const newSearch: RecentSearch = {
        id: Date.now().toString(),
        query: searchQuery,
        timestamp: Date.now(),
      };
      
      setRecentSearches(prev => [
        newSearch,
        ...prev.slice(0, 4) // Keep only the 5 most recent
      ]);
      
      // Navigate to search page
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsOpen(false);
      setQuery('');
    }
  };

  const handleSelectSuggestion = (suggestion: SearchResult) => {
    handleSearch(suggestion.title.replace(/^(Researcher|Publication|Trial): /, ''));
  };

  const handleRemoveRecentSearch = (id: string) => {
    setRecentSearches(prev => prev.filter(search => search.id !== id));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'researcher': return '👤';
      case 'publication': return '📚';
      case 'trial': return '🧪';
      default: return '🔍';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'researcher': return 'bg-blue-100 text-blue-800';
      case 'publication': return 'bg-green-100 text-green-800';
      case 'trial': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full max-w-md">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              placeholder="Search researchers, trials, publications..."
              className="pl-10 w-full"
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 h-5 w-5 -translate-y-1/2"
                onClick={() => setQuery('')}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent 
          className="w-full p-0" 
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <ScrollArea className="h-[300px]">
            {query.length > 0 ? (
              <div className="p-2">
                <div className="px-2 py-1 text-sm font-medium text-muted-foreground">
                  Search suggestions
                </div>
                {isLoading ? (
                  <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                    Loading...
                  </div>
                ) : suggestions.length > 0 ? (
                  <div className="space-y-1">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        className="flex w-full items-center justify-between rounded-sm px-2 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                        onClick={() => handleSelectSuggestion(suggestion)}
                      >
                        <div className="flex items-center">
                          <span className="mr-2">{getTypeIcon(suggestion.type)}</span>
                          <span>{suggestion.title}</span>
                        </div>
                        {suggestion.matchPercentage !== undefined && (
                          <Badge 
                            variant="secondary" 
                            className={getTypeColor(suggestion.type)}
                          >
                            {suggestion.matchPercentage}%
                          </Badge>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                    No suggestions found
                  </div>
                )}
              </div>
            ) : (
              <div className="p-2">
                <div className="px-2 py-1 text-sm font-medium text-muted-foreground">
                  Recent searches
                </div>
                {recentSearches.length > 0 ? (
                  <div className="space-y-1">
                    {recentSearches.map((search) => (
                      <div 
                        key={search.id} 
                        className="flex items-center justify-between rounded-sm px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                      >
                        <button
                          className="flex-1 text-left"
                          onClick={() => {
                            setQuery(search.query);
                            inputRef.current?.focus();
                          }}
                        >
                          {search.query}
                        </button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => handleRemoveRecentSearch(search.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                    No recent searches
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default GlobalSearchBar;