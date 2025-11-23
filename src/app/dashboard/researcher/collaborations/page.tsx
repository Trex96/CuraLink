'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import useSocket from '@/hooks/useSocket';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { RequestCollaborationDialog } from './components/request-collaboration-dialog';
import { CollaborationsList } from './components/collaborations-list';
import { Clock, CheckCircle, Users } from 'lucide-react';

interface CollaborationData {
  _id: string;
  requesterId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'declined';
  context: string;
  acceptedAt?: string;
  createdAt: string;
  updatedAt: string;
  requesterName: string;
  requesterInstitution: string;
  receiverName: string;
  receiverInstitution: string;
}

interface CollaborationEventData {
  message: string;
  // Add other common properties as needed
}

// Remove the empty interfaces since they don't add value
// interface NewCollaborationRequestData extends CollaborationEventData {}
// interface CollaborationAcceptedData extends CollaborationEventData {}
// interface CollaborationDeclinedData extends CollaborationEventData {}

// Use the base interface directly or add specific properties if needed
type NewCollaborationRequestData = CollaborationEventData;
type CollaborationAcceptedData = CollaborationEventData;
type CollaborationDeclinedData = CollaborationEventData;

// CollaborationResponse interface removed as it was unused

export default function CollaborationsPage() {
  const { user, loading: authLoading } = useAuth();
  const { socket, isConnected } = useSocket();
  const [collaborations, setCollaborations] = useState<CollaborationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('incoming');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchCollaborations = async () => {
      try {
        const response = await fetch('/api/collaborations/requests');
        if (!response.ok) throw new Error('Failed to fetch collaborations');
        const data = await response.json();
        setCollaborations(data);
      } catch (error) {
        toast.error('Error', {
          description: error instanceof Error ? error.message : 'Failed to fetch collaborations',
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchCollaborations();
    }
  }, [user]);

  useEffect(() => {
    if (!socket || !isConnected || !user) return;

    // Join user room
    socket.emit('user-join', user.id);

    // Listen for new collaboration requests
    const handleNewCollaborationRequest = (data: NewCollaborationRequestData) => {
      toast.info('New Collaboration Request', {
        description: data.message,
      });
      // Refresh collaborations list
      fetch('/api/collaborations/requests')
        .then(res => res.json())
        .then(data => setCollaborations(data));
    };

    // Listen for collaboration accepted
    const handleCollaborationAccepted = (data: CollaborationAcceptedData) => {
      toast.success('Collaboration Accepted', {
        description: data.message,
      });
      // Refresh collaborations list
      fetch('/api/collaborations/requests')
        .then(res => res.json())
        .then(data => setCollaborations(data));
    };

    // Listen for collaboration declined
    const handleCollaborationDeclined = (data: CollaborationDeclinedData) => {
      toast.info('Collaboration Declined', {
        description: data.message,
      });
      // Refresh collaborations list
      fetch('/api/collaborations/requests')
        .then(res => res.json())
        .then(data => setCollaborations(data));
    };

    socket.on('new-collaboration-request', handleNewCollaborationRequest);
    socket.on('collaboration-accepted', handleCollaborationAccepted);
    socket.on('collaboration-declined', handleCollaborationDeclined);

    return () => {
      socket.off('new-collaboration-request', handleNewCollaborationRequest);
      socket.off('collaboration-accepted', handleCollaborationAccepted);
      socket.off('collaboration-declined', handleCollaborationDeclined);
    };
  }, [socket, isConnected, user]);

  if (authLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You need to be logged in as a researcher to manage collaborations.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/auth/signin'}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleRequestSuccess = (newCollaboration: CollaborationData) => {
    setCollaborations(prev => [newCollaboration, ...prev]);
    toast.success('Success', {
      description: 'Collaboration request sent successfully',
    });
  };

  const handleAccept = async (id: string) => {
    try {
      const response = await fetch(`/api/collaborations/${id}/accept`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to accept collaboration');

      const updatedCollaboration = await response.json();
      setCollaborations(prev =>
        prev.map(collab => collab._id === id ? updatedCollaboration : collab)
      );

      toast.success('Success', {
        description: 'Collaboration accepted successfully',
      });
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to accept collaboration',
      });
    }
  };

  const handleDecline = async (id: string) => {
    try {
      const response = await fetch(`/api/collaborations/${id}/decline`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to decline collaboration');

      const updatedCollaboration = await response.json();
      setCollaborations(prev =>
        prev.map(collab => collab._id === id ? updatedCollaboration : collab)
      );

      toast.success('Success', {
        description: 'Collaboration declined',
      });
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to decline collaboration',
      });
    }
  };

  const handleCancel = async (id: string) => {
    try {
      const response = await fetch(`/api/collaborations/${id}/cancel`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to cancel request');

      setCollaborations(prev => prev.filter(collab => collab._id !== id));

      toast.success('Success', {
        description: 'Request cancelled',
      });
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to cancel request',
      });
    }
  };

  const handleUnfriend = async (id: string) => {
    try {
      const response = await fetch(`/api/collaborations/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove connection');

      setCollaborations(prev => prev.filter(collab => collab._id !== id));

      toast.success('Success', {
        description: 'Connection removed',
      });
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to remove connection',
      });
    }
  };

  // Filter collaborations by status and direction
  const incomingRequests = collaborations.filter(c => c.status === 'pending' && c.receiverId === user?.id);
  const outgoingRequests = collaborations.filter(c => c.status === 'pending' && c.requesterId === user?.id);
  const activeCollaborations = collaborations.filter(c => c.status === 'accepted');

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Researcher Collaborations</h1>
        <p className="text-muted-foreground">
          Manage your collaboration requests and active partnerships
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-muted-foreground mr-3" />
              <div>
                <p className="text-2xl font-bold">{incomingRequests.length}</p>
                <p className="text-sm text-muted-foreground">Incoming Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-muted-foreground mr-3" />
              <div>
                <p className="text-2xl font-bold">{outgoingRequests.length}</p>
                <p className="text-sm text-muted-foreground">Pending Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-muted-foreground mr-3" />
              <div>
                <p className="text-2xl font-bold">{activeCollaborations.length}</p>
                <p className="text-sm text-muted-foreground">Active Connections</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <TabsList>
            <TabsTrigger value="incoming" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Incoming
              {incomingRequests.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {incomingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="outgoing" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Pending
              {outgoingRequests.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {outgoingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Active
            </TabsTrigger>
          </TabsList>

          <Button onClick={() => setIsDialogOpen(true)}>
            Request Collaboration
          </Button>
        </div>

        <TabsContent value="incoming">
          <CollaborationsList
            collaborations={incomingRequests}
            loading={loading}
            onAccept={handleAccept}
            onDecline={handleDecline}
            userType="receiver"
            currentUserId={user?.id}
          />
        </TabsContent>

        <TabsContent value="outgoing">
          <CollaborationsList
            collaborations={outgoingRequests}
            loading={loading}
            onAccept={handleAccept}
            onDecline={handleCancel} // Using onDecline prop for cancel action
            userType="sender"
            currentUserId={user?.id}
          />
        </TabsContent>

        <TabsContent value="active">
          <CollaborationsList
            collaborations={activeCollaborations}
            loading={loading}
            onAccept={handleAccept}
            onDecline={handleUnfriend} // Using onDecline prop for unfriend action
            userType="both"
            currentUserId={user?.id}
          />
        </TabsContent>
      </Tabs>

      <RequestCollaborationDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onRequestSuccess={handleRequestSuccess}
      />
    </div>
  );
}