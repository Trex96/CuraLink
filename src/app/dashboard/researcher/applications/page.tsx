'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, XCircle, Clock, Search, User, FileText } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface Application {
    _id: string;
    status: 'pending' | 'approved' | 'rejected';
    message: string;
    patientInfo: {
        age?: number;
        gender?: string;
        medicalHistory?: string;
    };
    createdAt: string;
    patientId: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    trialId: {
        _id: string;
        nctNumber: string;
        title: string;
        status: string;
    };
}

export default function ApplicationsPage() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTab, setSelectedTab] = useState('all');
    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchApplications();
    }, []);

    useEffect(() => {
        let filtered = applications;

        // Filter by status
        if (selectedTab !== 'all') {
            filtered = filtered.filter(app => app.status === selectedTab);
        }

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(app =>
                app.patientId.firstName.toLowerCase().includes(query) ||
                app.patientId.lastName.toLowerCase().includes(query) ||
                app.trialId.title.toLowerCase().includes(query) ||
                app.trialId.nctNumber.toLowerCase().includes(query)
            );
        }

        setFilteredApplications(filtered);
    }, [applications, searchQuery, selectedTab]);

    const fetchApplications = async () => {
        try {
            const response = await fetch('/api/trials/applications/researcher');
            if (response.ok) {
                const data = await response.json();
                setApplications(data.applications || []);
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (applicationId: string, status: 'approved' | 'rejected') => {
        setActionLoading(true);
        try {
            const response = await fetch(`/api/trials/applications/${applicationId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                // Refresh applications
                await fetchApplications();
                setSelectedApplication(null);
            } else {
                alert('Failed to update application status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Error updating application status');
        } finally {
            setActionLoading(false);
        }
    };

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

    const pendingCount = applications.filter(a => a.status === 'pending').length;
    const approvedCount = applications.filter(a => a.status === 'approved').length;
    const rejectedCount = applications.filter(a => a.status === 'rejected').length;

    return (
        <div className="container py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Trial Applications</h1>
                <p className="text-muted-foreground">
                    Manage patient enrollment requests for your clinical trials
                </p>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by patient name or trial..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
                <TabsList>
                    <TabsTrigger value="all">
                        All ({applications.length})
                    </TabsTrigger>
                    <TabsTrigger value="pending">
                        Pending ({pendingCount})
                    </TabsTrigger>
                    <TabsTrigger value="approved">
                        Approved ({approvedCount})
                    </TabsTrigger>
                    <TabsTrigger value="rejected">
                        Rejected ({rejectedCount})
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Applications List */}
            {loading ? (
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
            ) : filteredApplications.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        <p>No applications found</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredApplications.map((application) => (
                        <Card key={application._id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <CardTitle className="text-lg">
                                                {application.patientId.firstName} {application.patientId.lastName}
                                            </CardTitle>
                                            {getStatusBadge(application.status)}
                                        </div>
                                        <CardDescription>
                                            Applied to: {application.trialId.title} ({application.trialId.nctNumber})
                                        </CardDescription>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSelectedApplication(application)}
                                    >
                                        <FileText className="h-4 w-4 mr-2" />
                                        View Details
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-muted-foreground">
                                        Applied {new Date(application.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </div>
                                    {application.status === 'pending' && (
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleStatusUpdate(application._id, 'rejected')}
                                                disabled={actionLoading}
                                            >
                                                <XCircle className="h-4 w-4 mr-1" />
                                                Reject
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => handleStatusUpdate(application._id, 'approved')}
                                                disabled={actionLoading}
                                            >
                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                Approve
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Application Details Dialog */}
            <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Application Details</DialogTitle>
                        <DialogDescription>
                            Review patient information and application message
                        </DialogDescription>
                    </DialogHeader>

                    {selectedApplication && (
                        <div className="space-y-6">
                            {/* Patient Info */}
                            <div>
                                <h3 className="font-semibold mb-3">Patient Information</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Name:</span>
                                        <p className="font-medium">
                                            {selectedApplication.patientId.firstName} {selectedApplication.patientId.lastName}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Email:</span>
                                        <p className="font-medium">{selectedApplication.patientId.email}</p>
                                    </div>
                                    {selectedApplication.patientInfo.age && (
                                        <div>
                                            <span className="text-muted-foreground">Age:</span>
                                            <p className="font-medium">{selectedApplication.patientInfo.age}</p>
                                        </div>
                                    )}
                                    {selectedApplication.patientInfo.gender && (
                                        <div>
                                            <span className="text-muted-foreground">Gender:</span>
                                            <p className="font-medium">{selectedApplication.patientInfo.gender}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Application Message */}
                            <div>
                                <h3 className="font-semibold mb-2">Application Message</h3>
                                <p className="text-sm bg-muted p-4 rounded-lg">{selectedApplication.message}</p>
                            </div>

                            {/* Medical History */}
                            {selectedApplication.patientInfo.medicalHistory && (
                                <div>
                                    <h3 className="font-semibold mb-2">Medical History</h3>
                                    <p className="text-sm bg-muted p-4 rounded-lg">
                                        {selectedApplication.patientInfo.medicalHistory}
                                    </p>
                                </div>
                            )}

                            {/* Actions */}
                            {selectedApplication.status === 'pending' && (
                                <div className="flex justify-end gap-2 pt-4 border-t">
                                    <Button
                                        variant="outline"
                                        onClick={() => handleStatusUpdate(selectedApplication._id, 'rejected')}
                                        disabled={actionLoading}
                                    >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Reject
                                    </Button>
                                    <Button
                                        onClick={() => handleStatusUpdate(selectedApplication._id, 'approved')}
                                        disabled={actionLoading}
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Approve
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
