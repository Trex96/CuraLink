'use client';

import { CollaborationRequestCard, CollaborationRequestCardSkeleton } from './collaboration-request-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface Collaboration {
  _id: string;
  requesterId: string;
  receiverId: string;
  requesterName: string;
  receiverName: string;
  requesterInstitution: string;
  receiverInstitution: string;
  context: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  acceptedAt?: string;
}

interface CollaborationsListProps {
  collaborations: Collaboration[];
  loading: boolean;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  userType: 'sender' | 'receiver' | 'both';
  currentUserId?: string;
}

export function CollaborationsList({
  collaborations,
  loading,
  onAccept,
  onDecline,
  userType,
  currentUserId
}: CollaborationsListProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Collaborations</CardTitle>
          <CardDescription>
            Your research collaboration requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <CollaborationRequestCardSkeleton key={i} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (collaborations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Collaborations</CardTitle>
          <CardDescription>
            Your research collaboration requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium">No collaborations found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {userType === 'sender'
                ? "You haven't sent any collaboration requests yet."
                : userType === 'receiver'
                  ? "You don't have any pending collaboration requests."
                  : "No collaborations match the current filter."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Collaborations</CardTitle>
        <CardDescription>
          Showing {collaborations.length} collaboration request{collaborations.length !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collaborations.map((collaboration) => (
            <CollaborationRequestCard
              key={collaboration._id}
              collaboration={collaboration}
              onAccept={onAccept}
              onDecline={onDecline}
              userType={userType}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}