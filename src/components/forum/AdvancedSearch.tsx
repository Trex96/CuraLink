'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Filter, X, Calendar as CalendarIcon, Loader2, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/utils';
import { ForumPostCard } from '@/components/forum/PostCard';
import { searchForumPosts, getForumCategories, getAllTags } from '@/lib/services/forum';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchFilters {
    category: string;
    tags: string[];
    authorRole: string;
    isVerified: boolean | undefined;
    dateRange: { from: Date | undefined; to: Date | undefined };
    sort: 'relevance' | 'date' | 'upvotes' | 'replies';
    order: 'asc' | 'desc';
}

interface AdvancedSearchProps {
    basePath?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ForumPost = any; // TODO: Import proper type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Category = any; // TODO: Import proper type

export function AdvancedSearch({ basePath = '/forum/search' }: AdvancedSearchProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initial state from URL
    const initialQuery = searchParams?.get('q') || '';
    const initialCategory = searchParams?.get('category') || '';
    const initialTags = searchParams?.get('tags')?.split(',').filter(Boolean) || [];
    const initialRole = searchParams?.get('authorRole') || '';
    const initialVerified = searchParams?.get('isVerified') === 'true' ? true : undefined;
    const initialSort = (searchParams?.get('sort') as SearchFilters['sort']) || 'relevance';
    const initialOrder = (searchParams?.get('order') as SearchFilters['order']) || 'desc';

    const [query, setQuery] = useState(initialQuery);
    const debouncedQuery = useDebounce(query, 500);

    const [filters, setFilters] = useState<SearchFilters>({
        category: initialCategory,
        tags: initialTags,
        authorRole: initialRole,
        isVerified: initialVerified,
        dateRange: { from: undefined, to: undefined },
        sort: initialSort,
        order: initialOrder
    });

    const [results, setResults] = useState<ForumPost[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [availableTags, setAvailableTags] = useState<string[]>([]);

    // Fetch metadata (categories, tags)
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [cats, tags] = await Promise.all([
                    getForumCategories(),
                    getAllTags()
                ]);
                setCategories(cats);
                setAvailableTags(tags);
            } catch (error) {
                console.error('Error fetching metadata:', error);
            }
        };
        fetchData();
    }, []);

    // Search function
    const performSearch = useCallback(async () => {
        setLoading(true);
        try {
            const data = await searchForumPosts(debouncedQuery, {
                category: filters.category || undefined,
                tags: filters.tags.length > 0 ? filters.tags : undefined,
                authorRole: filters.authorRole || undefined,
                isVerified: filters.isVerified,
                startDate: filters.dateRange.from,
                endDate: filters.dateRange.to,
                sort: filters.sort,
                order: filters.order,
                limit: 20 // Page size
            });
            setResults(data.posts);
            setTotal(data.total);
        } catch (error) {
            console.error('Search failed:', error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, [debouncedQuery, filters]);

    // Trigger search when query or filters change
    useEffect(() => {
        performSearch();

        // Update URL
        const params = new URLSearchParams();
        if (debouncedQuery) params.set('q', debouncedQuery);
        if (filters.category) params.set('category', filters.category);
        if (filters.tags.length > 0) params.set('tags', filters.tags.join(','));
        if (filters.authorRole) params.set('authorRole', filters.authorRole);
        if (filters.isVerified) params.set('isVerified', 'true');
        if (filters.sort !== 'relevance') params.set('sort', filters.sort);
        if (filters.order !== 'desc') params.set('order', filters.order);

        router.replace(`${basePath}?${params.toString()}`, { scroll: false });
    }, [debouncedQuery, filters, router, performSearch, basePath]);

    const clearFilters = () => {
        setFilters({
            category: '',
            tags: [],
            authorRole: '',
            isVerified: undefined,
            dateRange: { from: undefined, to: undefined },
            sort: 'relevance',
            order: 'desc'
        });
        setQuery('');
    };

    const FilterContent = () => (
        <div className="space-y-6">
            {/* Sort Section */}
            <div className="space-y-3">
                <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Sort By</Label>
                <div className="grid gap-2">
                    <Select
                        value={filters.sort}
                        onValueChange={(v) => setFilters(prev => ({ ...prev, sort: v as SearchFilters['sort'] }))}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="relevance">Relevance</SelectItem>
                            <SelectItem value="date">Date Created</SelectItem>
                            <SelectItem value="upvotes">Most Upvoted</SelectItem>
                            <SelectItem value="replies">Most Discussed</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="flex items-center border rounded-md p-1 bg-muted/20">
                        <Button
                            variant={filters.order === 'asc' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setFilters(prev => ({ ...prev, order: 'asc' }))}
                            className="flex-1 h-7 text-xs"
                        >
                            Ascending
                        </Button>
                        <Button
                            variant={filters.order === 'desc' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setFilters(prev => ({ ...prev, order: 'desc' }))}
                            className="flex-1 h-7 text-xs"
                        >
                            Descending
                        </Button>
                    </div>
                </div>
            </div>

            <div className="h-px bg-border" />

            {/* Categories Section */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Categories</Label>
                    {filters.category && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => setFilters(prev => ({ ...prev, category: '' }))}
                        >
                            Clear
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[180px] pr-4">
                    <div className="space-y-2">
                        {categories.map((cat) => (
                            <div key={cat._id || cat.name} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`cat-${cat.name}`}
                                    checked={filters.category === cat.name}
                                    onCheckedChange={(checked) => setFilters(prev => ({
                                        ...prev,
                                        category: checked ? cat.name : ''
                                    }))}
                                />
                                <label
                                    htmlFor={`cat-${cat.name}`}
                                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer w-full py-1"
                                >
                                    {cat.name}
                                </label>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            <div className="h-px bg-border" />

            {/* Role Section */}
            <div className="space-y-3">
                <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Author Role</Label>
                <Select
                    value={filters.authorRole}
                    onValueChange={(v) => setFilters(prev => ({ ...prev, authorRole: v === 'all' ? '' : v }))}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Any Role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Any Role</SelectItem>
                        <SelectItem value="patient">Patient</SelectItem>
                        <SelectItem value="researcher">Researcher</SelectItem>
                        <SelectItem value="doctor">Doctor</SelectItem>
                    </SelectContent>
                </Select>

                <div className="flex items-center space-x-2 mt-2">
                    <Checkbox
                        id="verified-filter"
                        checked={filters.isVerified === true}
                        onCheckedChange={(checked) => setFilters(prev => ({
                            ...prev,
                            isVerified: checked ? true : undefined
                        }))}
                    />
                    <label
                        htmlFor="verified-filter"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                        Verified Users Only
                    </label>
                </div>
            </div>

            <div className="h-px bg-border" />

            {/* Date Section */}
            <div className="space-y-3">
                <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Date Range</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal",
                                !filters.dateRange.from && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filters.dateRange.from ? (
                                filters.dateRange.to ? (
                                    <>
                                        {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                                        {format(filters.dateRange.to, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(filters.dateRange.from, "LLL dd, y")
                                )
                            ) : (
                                <span>Pick a date</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={filters.dateRange.from}
                            selected={filters.dateRange}
                            onSelect={(range) => setFilters(prev => ({ ...prev, dateRange: { from: range?.from, to: range?.to } }))}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            <div className="h-px bg-border" />

            {/* Tags Section */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Tags</Label>
                    {filters.tags.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => setFilters(prev => ({ ...prev, tags: [] }))}
                        >
                            Clear
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[120px]">
                    <div className="flex flex-wrap gap-2 pr-2">
                        {availableTags.slice(0, 20).map(tag => {
                            const isSelected = filters.tags.includes(tag);
                            return (
                                <Badge
                                    key={tag}
                                    variant={isSelected ? "default" : "outline"}
                                    className={cn(
                                        "cursor-pointer transition-all hover:bg-primary/90",
                                        isSelected ? "hover:bg-primary/90" : "hover:bg-accent hover:text-accent-foreground"
                                    )}
                                    onClick={() => {
                                        setFilters(prev => {
                                            const newTags = prev.tags.includes(tag)
                                                ? prev.tags.filter(t => t !== tag)
                                                : [...prev.tags, tag];
                                            return { ...prev, tags: newTags };
                                        });
                                    }}
                                >
                                    {tag}
                                    {isSelected && <X className="ml-1 h-3 w-3" />}
                                </Badge>
                            );
                        })}
                    </div>
                </ScrollArea>
            </div>

            <Button
                variant="outline"
                className="w-full mt-4 border-dashed"
                onClick={clearFilters}
            >
                Reset All Filters
            </Button>
        </div>
    );

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Mobile Filter Sheet */}
            <div className="lg:hidden mb-4">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="w-full flex justify-between items-center">
                            <span className="flex items-center gap-2">
                                <Filter className="h-4 w-4" />
                                Filters
                            </span>
                            {(filters.category || filters.tags.length > 0 || filters.authorRole || filters.dateRange.from) && (
                                <Badge variant="secondary" className="ml-2 h-5 px-1.5">Active</Badge>
                            )}
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
                        <SheetHeader className="mb-6">
                            <SheetTitle>Search Filters</SheetTitle>
                        </SheetHeader>
                        <FilterContent />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-72 flex-shrink-0">
                <div className="sticky top-4">
                    <Card>
                        <CardHeader className="pb-4 border-b">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <Filter className="h-5 w-5" />
                                Filters
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <FilterContent />
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
                <div className="mb-6 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search discussions, questions, and answers..."
                            className="pl-10 h-12 text-lg shadow-sm"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        {query && (
                            <button
                                onClick={() => setQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Active Filters Display */}
                    {(filters.category || filters.tags.length > 0 || filters.authorRole || filters.dateRange.from) && (
                        <div className="flex flex-wrap gap-2 items-center">
                            <span className="text-sm text-muted-foreground mr-2">Active filters:</span>
                            {filters.category && (
                                <Badge variant="secondary" className="flex items-center gap-1 pl-2 pr-1 py-1">
                                    Category: {filters.category}
                                    <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 rounded-full hover:bg-muted-foreground/20" onClick={() => setFilters(p => ({ ...p, category: '' }))}>
                                        <X className="h-3 w-3" />
                                    </Button>
                                </Badge>
                            )}
                            {filters.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="flex items-center gap-1 pl-2 pr-1 py-1">
                                    #{tag}
                                    <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 rounded-full hover:bg-muted-foreground/20" onClick={() => setFilters(p => ({ ...p, tags: p.tags.filter(t => t !== tag) }))}>
                                        <X className="h-3 w-3" />
                                    </Button>
                                </Badge>
                            ))}
                            {filters.authorRole && (
                                <Badge variant="secondary" className="flex items-center gap-1 pl-2 pr-1 py-1">
                                    Role: {filters.authorRole}
                                    <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 rounded-full hover:bg-muted-foreground/20" onClick={() => setFilters(p => ({ ...p, authorRole: '' }))}>
                                        <X className="h-3 w-3" />
                                    </Button>
                                </Badge>
                            )}
                            {filters.dateRange.from && (
                                <Badge variant="secondary" className="flex items-center gap-1 pl-2 pr-1 py-1">
                                    Date: {format(filters.dateRange.from, 'MMM d')} - {filters.dateRange.to ? format(filters.dateRange.to, 'MMM d') : '...'}
                                    <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 rounded-full hover:bg-muted-foreground/20" onClick={() => setFilters(p => ({ ...p, dateRange: { from: undefined, to: undefined } }))}>
                                        <X className="h-3 w-3" />
                                    </Button>
                                </Badge>
                            )}
                            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={clearFilters}>
                                Clear all
                            </Button>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="text-muted-foreground animate-pulse">Searching discussions...</p>
                    </div>
                ) : results.length > 0 ? (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b">
                            <p className="text-sm font-medium text-muted-foreground">
                                Found {total} result{total !== 1 ? 's' : ''}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>Sorted by {filters.sort}</span>
                                {filters.order === 'asc' ? <ArrowUpDown className="h-3 w-3 rotate-180" /> : <ArrowUpDown className="h-3 w-3" />}
                            </div>
                        </div>
                        <div className="grid gap-4">
                            {results.map((post) => (
                                <ForumPostCard key={post._id} post={post} searchQuery={debouncedQuery} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="bg-muted/50 p-4 rounded-full mb-4">
                                <Search className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">No results found</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                                We couldn&apos;t find any posts matching your search criteria. Try adjusting your filters or using different keywords.
                            </p>
                            <Button variant="outline" onClick={clearFilters}>
                                Clear all filters
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
