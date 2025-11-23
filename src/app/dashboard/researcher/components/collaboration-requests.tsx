'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Clock, CheckCircle, MessageCircle } from 'lucide-react';
import Link from 'next/link';

interface Collaboration {
  _id: string;
  requesterName: string;
  requesterInstitution: string;
  context: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export function CollaborationRequests({ collaborations, loading, error }: { 
  collaborations: Collaboration[]; 
  loading: boolean; 
  error: string | null;
}) {
  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Collaboration Requests
          </CardTitle>
          <CardDescription>Pending and accepted collaboration requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-8 w-20 rounded-md" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Collaboration Requests
          </CardTitle>
          <CardDescription>Pending and accepted collaboration requests</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Failed to load collaborations: {error}</p>
        </CardContent>
      </Card>
    );
  }

  const pendingRequests = collaborations.filter(c => c.status === 'pending');
  const acceptedRequests = collaborations.filter(c => c.status === 'accepted');

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="mr-2 h-5 w-5" />
          Collaboration Requests
        </CardTitle>
        <CardDescription>Pending and accepted collaboration requests</CardDescription>
      </CardHeader>
      <CardContent>
        {collaborations.length === 0 ? (
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium">No collaboration requests</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              You don&apos;t have any pending or accepted collaboration requests.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingRequests.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  Pending ({pendingRequests.length})
                </h3>
                <div className="space-y-3">
                  {pendingRequests.map((collaboration) => (
                    <div key={collaboration._id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="bg-secondary h-10 w-10 rounded-full flex items-center justify-center">
                          <span className="font-semibold text-sm">
                            {collaboration.requesterName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {collaboration.requesterName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {collaboration.requesterInstitution}
                        </p>
                        <p className="text-xs mt-1 line-clamp-2">
                          {collaboration.context}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        Review
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {acceptedRequests.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Accepted ({acceptedRequests.length})
                </h3>
                <div className="space-y-3">
                  {acceptedRequests.map((collaboration) => (
                    <div key={collaboration._id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="bg-secondary h-10 w-10 rounded-full flex items-center justify-center">
                          <span className="font-semibold text-sm">
                            {collaboration.requesterName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {collaboration.requesterName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {collaboration.requesterInstitution}
                        </p>
                        <p className="text-xs mt-1 line-clamp-2">
                          {collaboration.context}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/messages?collaboration=${collaboration._id}`}>
                          <MessageCircle className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        <div className="mt-6">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/dashboard/researcher/collaborations">
              View All Requests
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}