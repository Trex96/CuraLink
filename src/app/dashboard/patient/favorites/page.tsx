'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, BookOpen, FlaskConical, MessageSquare, User } from 'lucide-react';
import { ResearcherCard } from '@/components/cards/ResearcherCard';
import { TrialCard } from '@/components/cards/TrialCard';
import { PublicationCard } from '@/components/cards/PublicationCard';
import { ForumPostCard } from '@/components/cards/ForumPostCard';

export default function FavoritesPage() {
    const [favorites, setFavorites] = useState<any>({
        researchers: [],
        trials: [],
        publications: [],
        posts: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const res = await fetch('/api/dashboard/patient/favorites');
                if (!res.ok) throw new Error('Failed to fetch favorites');
                const data = await res.json();
                setFavorites(data);
            } catch (err) {
                setError('Failed to load favorites');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, []);

    if (loading) {
        return (
            <div className="container py-8 space-y-6">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <Skeleton className="h-12 w-full max-w-md" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-[300px] rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
                    <Heart className="h-8 w-8 text-destructive" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
                <p className="text-muted-foreground">{error}</p>
            </div>
        );
    }

    const hasFavorites =
        favorites.researchers.length > 0 ||
        favorites.trials.length > 0 ||
        favorites.publications.length > 0 ||
        favorites.posts.length > 0;

    return (
        <div className="container py-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Favorites</h1>
                <p className="text-muted-foreground mt-2">
                    Manage your bookmarked researchers, trials, publications, and forum discussions.
                </p>
            </div>

            {!hasFavorites ? (
                <Card className="bg-muted/50 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <Heart className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-semibold">No favorites yet</h3>
                        <p className="text-muted-foreground max-w-sm mt-2">
                            Start exploring and bookmark items to see them here.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <Tabs defaultValue="researchers" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="researchers" className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Researchers ({favorites.researchers.length})
                        </TabsTrigger>
                        <TabsTrigger value="trials" className="flex items-center gap-2">
                            <FlaskConical className="h-4 w-4" />
                            Trials ({favorites.trials.length})
                        </TabsTrigger>
                        <TabsTrigger value="publications" className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            Publications ({favorites.publications.length})
                        </TabsTrigger>
                        <TabsTrigger value="posts" className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Discussions ({favorites.posts.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="researchers" className="space-y-4">
                        {favorites.researchers.length === 0 ? (
                            <p className="text-muted-foreground py-8">No favorite researchers yet.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {favorites.researchers.map((researcher: any) => (
                                    <ResearcherCard key={researcher._id} researcher={{ ...researcher, id: researcher._id }} />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="trials" className="space-y-4">
                        {favorites.trials.length === 0 ? (
                            <p className="text-muted-foreground py-8">No favorite trials yet.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {favorites.trials.map((trial: any) => (
                                    <TrialCard key={trial._id} trial={{ ...trial, id: trial._id }} />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="publications" className="space-y-4">
                        {favorites.publications.length === 0 ? (
                            <p className="text-muted-foreground py-8">No favorite publications yet.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {favorites.publications.map((pub: any) => (
                                    <PublicationCard key={pub._id} publication={{ ...pub, id: pub._id }} />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="posts" className="space-y-4">
                        {favorites.posts.length === 0 ? (
                            <p className="text-muted-foreground py-8">No favorite discussions yet.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {favorites.posts.map((post: any) => (
                                    <ForumPostCard key={post._id} post={{ ...post, id: post._id, author: post.authorId ? `${post.authorId.firstName} ${post.authorId.lastName}` : 'Unknown' }} />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}
