'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, List, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Trial {
    _id: string;
    nctNumber: string;
    title: string;
    status: string;
    phase: string;
    enrollment?: number;
}

interface Application {
    _id: string;
    status: string;
    createdAt: string;
    patientId: {
        firstName: string;
        lastName: string;
        email: string;
    };
    trialId: {
        nctNumber: string;
        title: string;
    };
}

export function ResearcherTrialsWidget() {
    const [trials, setTrials] = useState<Trial[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAllTrials, setShowAllTrials] = useState(false);
    const [showAllApplications, setShowAllApplications] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch trials
                const trialsRes = await fetch('/api/trials/researcher/mine');
                if (trialsRes.ok) {
                    const trialsData = await trialsRes.json();
                    setTrials(trialsData.trials || []);
                }

                // Fetch applications
                const appsRes = await fetch('/api/trials/applications/researcher');
                if (appsRes.ok) {
                    const appsData = await appsRes.json();
                    setApplications(appsData.applications || []);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const pendingCount = applications.filter(a => a.status === 'pending').length;
    const displayTrials = trials.slice(0, 3);
    const displayApplications = applications.slice(0, 3);
    const hasMoreTrials = trials.length > 3;
    const hasMoreApplications = applications.length > 3;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return (
                    <Badge variant="outline" className="text-yellow-600">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                    </Badge>
                );
            case 'approved':
                return (
                    <Badge className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approved
                    </Badge>
                );
            case 'rejected':
                return (
                    <Badge variant="secondary">
                        <XCircle className="h-3 w-3 mr-1" />
                        Rejected
                    </Badge>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <div className="grid gap-6 md:grid-cols-2">
                {/* Trials Management */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>My Clinical Trials</CardTitle>
                                <CardDescription>Manage your active trials</CardDescription>
                            </div>
                            <List className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-2">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                                ))}
                            </div>
                        ) : trials.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <p className="mb-4">No trials yet</p>
                                <Button asChild size="sm">
                                    <Link href="/dashboard/researcher/trials/create">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create First Trial
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-3 mb-4">
                                    {displayTrials.map((trial) => (
                                        <div
                                            key={trial._id}
                                            className="flex items-start justify-between p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                                            onClick={() => window.location.href = '/dashboard/researcher/trials'}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate">{trial.title}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="outline" className="text-xs">
                                                        {trial.nctNumber}
                                                    </Badge>
                                                    <Badge variant="secondary" className="text-xs">
                                                        {trial.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    {hasMoreTrials ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => setShowAllTrials(true)}
                                        >
                                            <Eye className="h-4 w-4 mr-1" />
                                            View All ({trials.length})
                                        </Button>
                                    ) : (
                                        <Button asChild variant="outline" size="sm" className="flex-1">
                                            <Link href="/dashboard/researcher/trials">View All</Link>
                                        </Button>
                                    )}
                                    <Button asChild size="sm" className="flex-1">
                                        <Link href="/dashboard/researcher/trials/create">
                                            <Plus className="h-4 w-4 mr-1" />
                                            New Trial
                                        </Link>
                                    </Button>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Application Requests */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Trial Applications</CardTitle>
                                <CardDescription>Patient enrollment requests</CardDescription>
                            </div>
                            {pendingCount > 0 && (
                                <Badge variant="destructive">{pendingCount} Pending</Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-2">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                                ))}
                            </div>
                        ) : applications.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>No applications yet</p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-3 mb-4">
                                    {displayApplications.map((app) => (
                                        <div
                                            key={app._id}
                                            className="flex items-start justify-between p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                                            onClick={() => window.location.href = '/dashboard/researcher/applications'}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm">
                                                    {app.patientId.firstName} {app.patientId.lastName}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate mt-1">
                                                    {app.trialId.title}
                                                </p>
                                            </div>
                                            <div>
                                                {getStatusBadge(app.status)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {hasMoreApplications ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => setShowAllApplications(true)}
                                    >
                                        <Eye className="h-4 w-4 mr-1" />
                                        View All ({applications.length})
                                    </Button>
                                ) : (
                                    <Button asChild variant="outline" size="sm" className="w-full">
                                        <Link href="/dashboard/researcher/applications">
                                            View All Applications
                                        </Link>
                                    </Button>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* All Trials Dialog */}
            <Dialog open={showAllTrials} onOpenChange={setShowAllTrials}>
                <DialogContent className="max-w-3xl max-h-[80vh]">
                    <DialogHeader>
                        <DialogTitle>All Clinical Trials ({trials.length})</DialogTitle>
                        <DialogDescription>
                            Complete list of your clinical trials
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="h-[500px] pr-4">
                        <div className="space-y-3">
                            {trials.map((trial) => (
                                <div
                                    key={trial._id}
                                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                                    onClick={() => {
                                        setShowAllTrials(false);
                                        window.location.href = '/dashboard/researcher/trials';
                                    }}
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium mb-2">{trial.title}</p>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Badge variant="outline">
                                                {trial.nctNumber}
                                            </Badge>
                                            <Badge variant="secondary">
                                                {trial.status}
                                            </Badge>
                                            <Badge variant="outline">
                                                {trial.phase}
                                            </Badge>
                                            {trial.enrollment && (
                                                <Badge variant="outline" className="text-xs">
                                                    Target: {trial.enrollment} patients
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button variant="outline" onClick={() => setShowAllTrials(false)}>
                            Close
                        </Button>
                        <Button asChild>
                            <Link href="/dashboard/researcher/trials">
                                Go to Trials Page
                            </Link>
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* All Applications Dialog */}
            <Dialog open={showAllApplications} onOpenChange={setShowAllApplications}>
                <DialogContent className="max-w-3xl max-h-[80vh]">
                    <DialogHeader>
                        <DialogTitle>All Applications ({applications.length})</DialogTitle>
                        <DialogDescription>
                            Complete list of patient enrollment requests
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="h-[500px] pr-4">
                        <div className="space-y-3">
                            {applications.map((app) => (
                                <div
                                    key={app._id}
                                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                                    onClick={() => {
                                        setShowAllApplications(false);
                                        window.location.href = '/dashboard/researcher/applications';
                                    }}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <p className="font-medium">
                                                {app.patientId.firstName} {app.patientId.lastName}
                                            </p>
                                            {getStatusBadge(app.status)}
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-1">
                                            {app.trialId.title}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-xs">
                                                {app.trialId.nctNumber}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(app.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button variant="outline" onClick={() => setShowAllApplications(false)}>
                            Close
                        </Button>
                        <Button asChild>
                            <Link href="/dashboard/researcher/applications">
                                Manage Applications
                            </Link>
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
