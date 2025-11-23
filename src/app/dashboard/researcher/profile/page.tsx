'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Briefcase, GraduationCap, Link as LinkIcon, Edit, Plus, Building2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface UserProfile {
    _id: string;
    firstName: string;
    lastName: string;
    institution: string;
    bio: string;
    expertise: string[];
    profilePicture?: string;
    location?: {
        address?: string;
    };
    orcidId?: string;
}

export default function ResearcherProfilePage() {
    const { user: authUser } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/researchers/profile');
                if (!res.ok) throw new Error('Failed to fetch profile');
                const data = await res.json();
                setProfile(data);
            } catch (error) {
                console.error(error);
                toast.error('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        if (authUser) {
            fetchProfile();
        }
    }, [authUser]);

    if (loading) {
        return (
            <div className="container py-8 space-y-6">
                <Skeleton className="h-64 w-full rounded-xl" />
                <Skeleton className="h-40 w-full rounded-xl" />
                <Skeleton className="h-40 w-full rounded-xl" />
            </div>
        );
    }

    if (!profile) return null;

    const getInitials = (first: string, last: string) => {
        return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
    };

    return (
        <div className="container py-8 max-w-5xl mx-auto space-y-6">
            {/* Header Card */}
            <Card className="overflow-hidden border-none shadow-md">
                {/* Banner */}
                <div className="h-32 md:h-48 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
                    <Button
                        variant="secondary"
                        size="sm"
                        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Edit className="h-4 w-4 mr-2" /> Edit Cover
                    </Button>
                </div>

                <CardContent className="relative pt-0 pb-8 px-6 md:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-start">
                        {/* Avatar & Info */}
                        <div className="flex flex-col md:flex-row items-start gap-6 -mt-12 md:-mt-16 mb-4 md:mb-0">
                            <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-background shadow-lg">
                                <AvatarImage src={profile.profilePicture} alt={profile.firstName} />
                                <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                                    {getInitials(profile.firstName, profile.lastName)}
                                </AvatarFallback>
                            </Avatar>

                            <div className="mt-12 md:mt-20 space-y-2">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                                        {profile.firstName} {profile.lastName}
                                    </h1>
                                    <p className="text-lg text-muted-foreground font-medium flex items-center gap-2">
                                        <Briefcase className="h-4 w-4" /> Researcher at {profile.institution}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                    {profile.location?.address && (
                                        <span className="flex items-center gap-1">
                                            <MapPin className="h-4 w-4" /> {profile.location.address}
                                        </span>
                                    )}
                                    {profile.orcidId && (
                                        <Link href={`https://orcid.org/${profile.orcidId}`} target="_blank" className="flex items-center gap-1 hover:text-primary hover:underline">
                                            <LinkIcon className="h-4 w-4" /> ORCID: {profile.orcidId}
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 md:mt-20 flex gap-2">
                            <Button asChild>
                                <Link href="/dashboard/researcher/profile/edit">
                                    <Edit className="h-4 w-4 mr-2" /> Edit Profile
                                </Link>
                            </Button>
                            <Button variant="outline">
                                More
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* About Section */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>About</CardTitle>
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard/researcher/profile/edit">
                            <Edit className="h-4 w-4" />
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                        {profile.bio || "No bio added yet. Click edit to add a summary of your research interests and background."}
                    </p>
                </CardContent>
            </Card>

            {/* Experience / Institution */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Experience</CardTitle>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                            <Plus className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/dashboard/researcher/profile/edit">
                                <Edit className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex gap-4">
                        <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                            <Building2 className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Researcher</h3>
                            <p className="text-foreground">{profile.institution}</p>
                            <p className="text-sm text-muted-foreground">Present</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Skills / Expertise */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Skills & Expertise</CardTitle>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                            <Plus className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/dashboard/researcher/profile/edit">
                                <Edit className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {profile.expertise && profile.expertise.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {profile.expertise.map((skill, index) => (
                                <Badge key={index} variant="secondary" className="px-3 py-1 text-sm">
                                    {skill}
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-sm">No expertise listed.</p>
                    )}
                </CardContent>
            </Card>

            {/* Publications Preview */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Publications</CardTitle>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/dashboard/researcher/publications/add">
                                <Plus className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/dashboard/researcher/publications">
                                <Edit className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-4">
                        <Button variant="outline" asChild>
                            <Link href="/dashboard/researcher/publications">View All Publications</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
