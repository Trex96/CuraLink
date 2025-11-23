'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Users, BookOpen, MessageSquare, Eye, Award, Share2 } from 'lucide-react';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { toast } from 'sonner';

interface ProfileViewStat {
    date: string;
    count: number;
}

interface AnalyticsData {
    totalPublications: number;
    totalCitations: number;
    activeCollaborations: number;
    verifiedAnswers: number;
    totalViews: number;
    profileViews: ProfileViewStat[];
    impactScore: number;
}

export default function ResearcherAnalyticsPage() {
    const { user, loading: authLoading } = useAuth();
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await fetch('/api/dashboard/researcher/analytics');
                if (!res.ok) throw new Error('Failed to fetch analytics');
                const data = await res.json();
                setAnalytics(data);
            } catch (err) {
                console.error(err);
                toast.error('Failed to load analytics data');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchAnalytics();
        }
    }, [user]);

    if (authLoading || loading) {
        return (
            <div className="container py-8 space-y-8">
                <Skeleton className="h-12 w-64" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
                <Skeleton className="h-96" />
            </div>
        );
    }

    if (!user || user.role !== 'researcher') {
        return (
            <div className="container py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Access Denied</CardTitle>
                        <CardDescription>You need to be logged in as a researcher to view analytics.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/auth/signin" className="text-primary hover:underline">
                            Sign In
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container py-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
                    <p className="text-muted-foreground">
                        Track your research impact, engagement, and network growth.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        <span className="font-bold">Impact Score: {analytics?.impactScore || 0}</span>
                    </div>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Citations</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics?.totalCitations || 0}</div>
                        <p className="text-xs text-muted-foreground">Across {analytics?.totalPublications || 0} publications</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics?.totalViews || 0}</div>
                        <p className="text-xs text-muted-foreground">Last 30 days</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Network Size</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics?.activeCollaborations || 0}</div>
                        <p className="text-xs text-muted-foreground">Active connections</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Community Impact</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics?.verifiedAnswers || 0}</div>
                        <p className="text-xs text-muted-foreground">Verified answers</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Profile Engagement</CardTitle>
                        <CardDescription>Daily profile views over the last 30 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            {analytics?.profileViews && analytics.profileViews.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={analytics.profileViews}>
                                        <defs>
                                            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <Tooltip
                                            labelFormatter={(value) => new Date(value).toLocaleDateString()}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="count"
                                            stroke="#8884d8"
                                            fillOpacity={1}
                                            fill="url(#colorViews)"
                                            name="Views"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    No data available
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Grow Your Impact</CardTitle>
                        <CardDescription>Recommended actions to increase your score</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start space-x-4 p-3 bg-muted/50 rounded-lg">
                            <Share2 className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-sm">Expand Network</h4>
                                <p className="text-xs text-muted-foreground mb-2">Connect with other researchers and patients.</p>
                                <Link href="/dashboard/researcher/network" className="text-primary text-xs font-medium hover:underline">
                                    Find People →
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4 p-3 bg-muted/50 rounded-lg">
                            <BookOpen className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-sm">Publish More</h4>
                                <p className="text-xs text-muted-foreground mb-2">Add your latest research publications.</p>
                                <Link href="/dashboard/researcher/publications" className="text-primary text-xs font-medium hover:underline">
                                    Import Publications →
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4 p-3 bg-muted/50 rounded-lg">
                            <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-sm">Engage in Forum</h4>
                                <p className="text-xs text-muted-foreground mb-2">Answer patient questions to earn verification.</p>
                                <Link href="/dashboard/researcher/forum" className="text-primary text-xs font-medium hover:underline">
                                    Go to Forum →
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
