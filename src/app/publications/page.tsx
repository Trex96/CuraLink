'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, BookOpen, Calendar, Users } from 'lucide-react';
import Link from 'next/link';

interface Publication {
    _id: string;
    pmid: string;
    title: string;
    authors: string[];
    journal: string;
    publicationDate: string;
    doi?: string;
    abstract: string;
}

export default function PublicationsPage() {
    const [publications, setPublications] = useState<Publication[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredPublications, setFilteredPublications] = useState<Publication[]>([]);

    useEffect(() => {
        const fetchPublications = async () => {
            try {
                const res = await fetch('/api/search/publications', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: '', limit: 50 })
                });

                if (res.ok) {
                    const data = await res.json();
                    setPublications(data.publications || []);
                    setFilteredPublications(data.publications || []);
                }
            } catch (error) {
                console.error('Error fetching publications:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPublications();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredPublications(publications);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = publications.filter(pub =>
                pub.title.toLowerCase().includes(query) ||
                pub.authors.some(author => author.toLowerCase().includes(query)) ||
                pub.journal.toLowerCase().includes(query) ||
                pub.abstract.toLowerCase().includes(query)
            );
            setFilteredPublications(filtered);
        }
    }, [searchQuery, publications]);

    const handleSearch = async () => {
        if (searchQuery.trim() === '') return;

        setLoading(true);
        try {
            const res = await fetch('/api/search/publications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: searchQuery, limit: 50 })
            });

            if (res.ok) {
                const data = await res.json();
                setPublications(data.publications || []);
                setFilteredPublications(data.publications || []);
            }
        } catch (error) {
            console.error('Error searching publications:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container py-8">
                <Skeleton className="h-12 w-64 mb-8" />
                <Skeleton className="h-12 w-full mb-8" />
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-48" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-4">Research Publications</h1>
                <p className="text-xl text-muted-foreground">
                    Browse and discover medical research publications
                </p>
            </div>

            {/* Search Bar */}
            <div className="mb-8">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by title, author, journal, or keywords..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="pl-10"
                        />
                    </div>
                    <Button onClick={handleSearch}>
                        Search
                    </Button>
                </div>
            </div>

            {/* Results Count */}
            <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                    Showing {filteredPublications.length} publication{filteredPublications.length !== 1 ? 's' : ''}
                </p>
            </div>

            {/* Publications List */}
            {filteredPublications.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No publications found</h3>
                        <p className="text-muted-foreground text-center max-w-md">
                            {searchQuery ? 'Try adjusting your search terms' : 'No publications are currently available'}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {filteredPublications.map((publication) => (
                        <Card key={publication._id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <CardTitle className="text-xl">
                                    <Link
                                        href={`/publications/${publication._id}`}
                                        className="hover:text-primary transition-colors"
                                    >
                                        {publication.title}
                                    </Link>
                                </CardTitle>
                                <CardDescription className="flex flex-wrap gap-4 mt-2">
                                    <span className="flex items-center">
                                        <Users className="h-4 w-4 mr-1" />
                                        {publication.authors.slice(0, 3).join(', ')}
                                        {publication.authors.length > 3 && ` +${publication.authors.length - 3} more`}
                                    </span>
                                    <span className="flex items-center">
                                        <BookOpen className="h-4 w-4 mr-1" />
                                        {publication.journal}
                                    </span>
                                    <span className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-1" />
                                        {new Date(publication.publicationDate).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                                    {publication.abstract}
                                </p>
                                <div className="flex gap-2 flex-wrap">
                                    {publication.pmid && (
                                        <a
                                            href={`https://pubmed.ncbi.nlm.nih.gov/${publication.pmid}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-primary hover:underline"
                                        >
                                            PubMed: {publication.pmid}
                                        </a>
                                    )}
                                    {publication.doi && (
                                        <a
                                            href={`https://doi.org/${publication.doi}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-primary hover:underline"
                                        >
                                            DOI: {publication.doi}
                                        </a>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
