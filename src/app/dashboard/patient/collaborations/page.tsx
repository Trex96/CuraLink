'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import useSocket from '@/hooks/useSocket';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Search,
    UserMinus,
    MessageSquare,
    Users,
    UserCheck,
    Clock,
    X,
    Check
} from 'lucide-react';
import { toast } from 'sonner';
import { ProfileDialog } from '@/components/profile/ProfileDialog';

interface CollaborationData {
    _id: string;
    requesterId: string;
    receiverId: string;
    status: 'pending' | 'accepted' | 'declined';
    context: string;
    acceptedAt?: string;
    createdAt: string;
    requesterName: string;
    requesterInstitution: string;
    receiverName: string;
    receiverInstitution: string;
}

export default function PatientConnectionsPage() {
    const { user, loading: authLoading } = useAuth();
    const { socket, isConnected } = useSocket();
    const [connections, setConnections] = useState<CollaborationData[]>([]);
    const [filteredConnections, setFilteredConnections] = useState<CollaborationData[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState<'connections' | 'requests'>('connections');
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [profileDialogOpen, setProfileDialogOpen] = useState(false);

    useEffect(() => {
        const fetchConnections = async () => {
            try {
                const response = await fetch('/api/collaborations/requests');
                if (!response.ok) throw new Error('Failed to fetch connections');
                const data = await response.json();
                setConnections(data);
            } catch (error) {
                toast.error('Failed to load connections');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchConnections();
        }
    }, [user]);

    // Socket event listeners
    useEffect(() => {
        if (!socket || !isConnected || !user) return;

        socket.emit('user-join', user.id);

        const refreshConnections = () => {
            fetch('/api/collaborations/requests')
                .then(res => res.json())
                .then(data => setConnections(data));
        };

        socket.on('new-collaboration-request', refreshConnections);
        socket.on('collaboration-accepted', refreshConnections);
        socket.on('collaboration-declined', refreshConnections);

        return () => {
            socket.off('new-collaboration-request');
            socket.off('collaboration-accepted');
            socket.off('collaboration-declined');
        };
    }, [socket, isConnected, user]);

    // Filter connections based on search
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredConnections(connections);
        } else {
            const filtered = connections.filter(conn => {
                const name = conn.requesterId === user?.id ? conn.receiverName : conn.requesterName;
                const institution = conn.requesterId === user?.id ? conn.receiverInstitution : conn.requesterInstitution;
                return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    institution.toLowerCase().includes(searchQuery.toLowerCase());
            });
            setFilteredConnections(filtered);
        }
    }, [searchQuery, connections, user]);

    const handleAccept = async (id: string) => {
        try {
            const response = await fetch(`/api/collaborations/${id}/accept`, { method: 'POST' });
            if (!response.ok) throw new Error('Failed to accept request');

            const updatedCollab = await response.json();
            setConnections(prev => prev.map(c => c._id === id ? updatedCollab : c));
            toast.success('Connection accepted!');
        } catch (error) {
            toast.error('Failed to accept request');
        }
    };

    const handleDecline = async (id: string) => {
        try {
            const response = await fetch(`/api/collaborations/${id}/decline`, { method: 'POST' });
            if (!response.ok) throw new Error('Failed to decline request');

            setConnections(prev => prev.filter(c => c._id !== id));
            toast.success('Request declined');
        } catch (error) {
            toast.error('Failed to decline request');
        }
    };

    const handleUnfriend = async (id: string) => {
        try {
            const response = await fetch(`/api/collaborations/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to remove connection');

            setConnections(prev => prev.filter(c => c._id !== id));
            toast.success('Connection removed');
        } catch (error) {
            toast.error('Failed to remove connection');
        }
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const getOtherUser = (conn: CollaborationData) => {
        const isRequester = conn.requesterId === user?.id;
        return {
            _id: isRequester ? conn.receiverId : conn.requesterId,
            name: isRequester ? conn.receiverName : conn.requesterName,
            institution: isRequester ? conn.receiverInstitution : conn.requesterInstitution,
            role: 'researcher' as const, // Default to researcher since we don't have this data right now
        };
    };

    const handleViewProfile = (conn: CollaborationData) => {
        const otherUser = getOtherUser(conn);
        setSelectedUser({
            ...otherUser,
            bio: conn.context,
            memberSince: conn.createdAt,
        });
        setProfileDialogOpen(true);
    };

    const acceptedConnections = filteredConnections.filter(c => c.status === 'accepted');
    const pendingRequests = filteredConnections.filter(c => c.status === 'pending' && c.receiverId === user?.id);

    if (authLoading || loading) {
        return (
            <div className="container max-w-5xl py-8 space-y-6">
                <Skeleton className="h-12 w-64" />
                <Skeleton className="h-10 w-full max-w-md" />
                <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => (
                        <Skeleton key={i} className="h-20 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container max-w-5xl py-8 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Connections</h1>
                <p className="text-muted-foreground mt-1">
                    Stay connected with researchers and fellow patients
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-bold">{acceptedConnections.length}</p>
                                <p className="text-sm text-muted-foreground">Total Connections</p>
                            </div>
                            <UserCheck className="h-10 w-10 text-primary opacity-20" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-bold">{pendingRequests.length}</p>
                                <p className="text-sm text-muted-foreground">Pending Requests</p>
                            </div>
                            <Clock className="h-10 w-10 text-orange-500 opacity-20" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* View Toggle & Search */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                        variant={activeView === 'connections' ? 'default' : 'outline'}
                        onClick={() => setActiveView('connections')}
                        className="flex-1 sm:flex-none"
                    >
                        <Users className="h-4 w-4 mr-2" />
                        Connections ({acceptedConnections.length})
                    </Button>
                    <Button
                        variant={activeView === 'requests' ? 'default' : 'outline'}
                        onClick={() => setActiveView('requests')}
                        className="flex-1 sm:flex-none relative"
                    >
                        <Clock className="h-4 w-4 mr-2" />
                        Requests ({pendingRequests.length})
                        {pendingRequests.length > 0 && (
                            <Badge className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                                {pendingRequests.length}
                            </Badge>
                        )}
                    </Button>
                </div>

                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search connections..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            {/* Connections List */}
            {activeView === 'connections' ? (
                <div className="space-y-3">
                    {acceptedConnections.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="p-12 text-center">
                                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
                                <p className="text-muted-foreground">
                                    {searchQuery ? 'No connections match your search' : 'No connections yet'}
                                </p>
                                <Button
                                    variant="link"
                                    className="mt-2"
                                    onClick={() => window.location.href = '/dashboard/patient/network'}
                                >
                                    Find Connections
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        acceptedConnections.map((conn) => {
                            const otherUser = getOtherUser(conn);
                            return (
                                <Card key={conn._id} className="group hover:shadow-md transition-shadow">
                                    <CardContent className="p-4 cursor-pointer" onClick={() => handleViewProfile(conn)}>
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                                <Avatar className="h-14 w-14 border-2 border-primary/10">
                                                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                                                        {getInitials(otherUser.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold truncate">{otherUser.name}</h3>
                                                    <p className="text-sm text-muted-foreground truncate">
                                                        {otherUser.institution}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Connected {new Date(conn.acceptedAt || conn.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => window.location.href = '/dashboard/patient/messages'}
                                                >
                                                    <MessageSquare className="h-4 w-4 sm:mr-2" />
                                                    <span className="hidden sm:inline">Message</span>
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => {
                                                        if (confirm(`Remove ${otherUser.name} from your connections?`)) {
                                                            handleUnfriend(conn._id);
                                                        }
                                                    }}
                                                >
                                                    <UserMinus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>
            ) : (
                // Pending Requests View
                <div className="space-y-3">
                    {pendingRequests.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="p-12 text-center">
                                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
                                <p className="text-muted-foreground">No pending requests</p>
                            </CardContent>
                        </Card>
                    ) : (
                        pendingRequests.map((conn) => {
                            const otherUser = getOtherUser(conn);
                            return (
                                <Card key={conn._id} className="border-l-4 border-l-orange-500">
                                    <CardContent className="p-4 cursor-pointer" onClick={() => handleViewProfile(conn)}>
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                                <Avatar className="h-14 w-14 border-2 border-orange-500/20">
                                                    <AvatarFallback className="bg-gradient-to-br from-orange-500/20 to-orange-500/10 text-orange-700 font-semibold">
                                                        {getInitials(otherUser.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold truncate">{otherUser.name}</h3>
                                                    <p className="text-sm text-muted-foreground truncate">
                                                        {otherUser.institution}
                                                    </p>
                                                    {conn.context && (
                                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1 italic">
                                                            "{conn.context}"
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Received {new Date(conn.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleAccept(conn._id)}
                                                    className="gap-1"
                                                >
                                                    <Check className="h-4 w-4" />
                                                    Accept
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleDecline(conn._id)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>
            )}

            {/* Profile Dialog */}
            {selectedUser && (
                <ProfileDialog
                    open={profileDialogOpen}
                    onOpenChange={setProfileDialogOpen}
                    user={selectedUser}
                    connectionStatus="connected"
                    onMessage={() => window.location.href = '/dashboard/patient/messages'}
                />
            )}
        </div>
    );
}
