'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AcceptDeclineButtons } from '@/app/dashboard/researcher/collaborations/components/accept-decline-buttons';
import { Clock, CheckCircle, XCircle, Building, Loader2, UserMinus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

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

interface CollaborationRequestCardProps {
  collaboration: Collaboration;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  userType: 'sender' | 'receiver' | 'both';
  currentUserId?: string;
}

export function CollaborationRequestCard({
  collaboration,
  onAccept,
  onDecline,
  userType,
  currentUserId
}: CollaborationRequestCardProps) {
  const getStatusBadge = () => {
    switch (collaboration.status) {
      case 'pending':
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
      case 'accepted':
        return <Badge variant="default" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Accepted</Badge>;
      case 'declined':
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" /> Declined</Badge>;
      default:
        return <Badge variant="secondary">{collaboration.status}</Badge>;
    }
  };

  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = async () => {
    setIsProcessing(true);
    try {
      await onDecline(collaboration._id);
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const isSender = currentUserId ? collaboration.requesterId === currentUserId : (userType === 'sender');
  const isReceiver = currentUserId ? collaboration.receiverId === currentUserId : (userType === 'receiver');
  // isBoth is no longer needed for logic if we have currentUserId, but kept for fallback
  const isBoth = userType === 'both';

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {isSender ? collaboration.receiverName : collaboration.requesterName}
              {getStatusBadge()}
            </CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <Building className="h-4 w-4" />
              {isSender ? collaboration.receiverInstitution : collaboration.requesterInstitution}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">
              {new Date(collaboration.createdAt).toLocaleDateString()}
            </div>
            {collaboration.acceptedAt && (
              <div className="text-xs text-muted-foreground">
                Accepted: {new Date(collaboration.acceptedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Collaboration Context</h4>
          <p className="text-sm text-muted-foreground">
            {collaboration.context}
          </p>
        </div>
      </CardContent>

      {(isReceiver) && collaboration.status === 'pending' && (
        <CardFooter className="flex justify-end">
          <AcceptDeclineButtons
            collaborationId={collaboration._id}
            onAccept={onAccept}
            onDecline={onDecline}
          />
        </CardFooter>
      )}

      {isSender && collaboration.status === 'pending' && (
        <CardFooter className="flex justify-end">
          <Button
            variant="outline"
            onClick={handleAction}
            disabled={isProcessing}
            size="sm"
          >
            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <X className="mr-2 h-4 w-4" />}
            Cancel Request
          </Button>
        </CardFooter>
      )}

      {collaboration.status === 'accepted' && (
        <CardFooter className="flex justify-end">
          <Button
            variant="destructive"
            onClick={handleAction}
            disabled={isProcessing}
            size="sm"
          >
            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserMinus className="mr-2 h-4 w-4" />}
            Unfriend
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

// Loading skeleton component
export function CollaborationRequestCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-16 w-full" />
        </div>
      </CardContent>

      <CardFooter className="flex justify-end">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </CardFooter>
    </Card>
  );
}