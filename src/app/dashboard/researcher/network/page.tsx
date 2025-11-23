'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Search, UserPlus, Clock, Check, MessageSquare, Briefcase, User as UserIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface NetworkUser {
    _id: string;
    firstName: string;
    lastName: string;
    role: 'researcher' | 'patient';
    institution?: string;
    expertise?: string[];
    conditions?: string[];
    profilePicture?: string;
    bio?: string;
    connectionStatus: 'none' | 'pending_sent' | 'pending_received' | 'connected' | 'declined';
    connectionId?: string;
}


export default function NetworkPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [users, setUsers] = useState<NetworkUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [connectingUser, setConnectingUser] = useState<NetworkUser | null>(null);
    const [connectMessage, setConnectMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [messagingUserId, setMessagingUserId] = useState<string | null>(null);


    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('q', searchQuery);
            if (activeTab !== 'all') params.append('role', activeTab);

            const response = await fetch(`/api/network/search?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch users');

            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load network suggestions');
        } finally {
            setLoading(false);
        }
    };

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, activeTab]);

    // Refetch when page becomes visible (user returns to tab/page)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                console.log('Page became visible, refetching users...');
                fetchUsers();
            }
        };

        const handleFocus = () => {
            console.log('Window focused, refetching users...');
            fetchUsers();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, [searchQuery, activeTab]);

    const handleConnect = async () => {
        if (!connectingUser) return;

        setIsSending(true);
        try {
            const response = await fetch('/api/collaborations/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    receiverId: connectingUser._id,
                    context: connectMessage || `Hi ${connectingUser.firstName}, I'd like to connect with you on CuraLink.`,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to send request');
            }

            toast.success('Connection request sent!');
            setConnectingUser(null);
            setConnectMessage('');

            // Update local state
            setUsers(users.map(u =>
                u._id === connectingUser._id
                    ? { ...u, connectionStatus: 'pending_sent' }
                    : u
            ));
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to send request');
        } finally {
            setIsSending(false);
        }
    };

    // Decline a received collaboration request
    const handleDecline = async (collaborationId: string) => {
        if (!collaborationId) return;
        setIsSending(true);
        try {
            const response = await fetch(`/api/collaborations/${collaborationId}/decline`, {
                method: 'POST',
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to decline request');
            }
            toast.success('Collaboration request declined');
            // Update local state: set the declined status for the user with this collaborationId
            setUsers(users.map(u =>
                u.connectionId === collaborationId
                    ? { ...u, connectionStatus: 'declined' }
                    : u
            ));
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to decline request');
        } finally {
            setIsSending(false);
        }
    };

    // Cancel a sent collaboration request
    const handleCancelRequest = async (collaborationId: string) => {
        if (!collaborationId) return;
        setIsSending(true);
        try {
            const response = await fetch(`/api/collaborations/${collaborationId}/cancel`, {
                method: 'POST',
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to cancel request');
            }
            toast.success('Request cancelled');
            // Update local state: reset status to none
            setUsers(users.map(u =>
                u.connectionId === collaborationId
                    ? { ...u, connectionStatus: 'none', connectionId: undefined }
                    : u
            ));
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to cancel request');
        } finally {
            setIsSending(false);
        }
    };

    const handleMessage = async (userId: string) => {
        setMessagingUserId(userId);
        try {
            const response = await fetch('/api/messages/conversation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ otherUserId: userId }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to start conversation');
            }

            const { collaborationId } = await response.json();

            // Navigate to messages page with collaboration ID
            const role = user?.role === 'researcher' ? 'researcher' : 'patient';
            router.push(`/dashboard/${role}/messages?conversation=${collaborationId}`);
        } catch (error) {
            console.error('Error starting conversation:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to start conversation');
        } finally {
            setMessagingUserId(null);
        }
    };

    const getInitials = (first: string, last: string) => {
        return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
    };

    return (
        <div className="container py-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Network</h1>
                    <p className="text-muted-foreground">
                        Connect with researchers and patients to expand your reach.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => window.location.href = '/dashboard/researcher/collaborations'}>
                        Manage Connections
                    </Button>
                </div>
            </div>

            <div className="flex flex-col space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, expertise, or institution..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
                        <TabsList className="grid w-full grid-cols-3 md:w-auto">
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="researcher">Researchers</TabsTrigger>
                            <TabsTrigger value="patient">Patients</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Card key={i} className="h-64 animate-pulse bg-muted/50" />
                        ))}
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <UserIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>No users found matching your search.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {users.filter(u => u._id !== user?.id).map((user) => (
                            <Card key={user._id} className="flex flex-col">
                                <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-2">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={user.profilePicture} alt={user.firstName} />
                                        <AvatarFallback>{getInitials(user.firstName, user.lastName)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-base font-semibold truncate">
                                                {user.firstName} {user.lastName}
                                            </CardTitle>
                                            {user.role === 'researcher' ? (
                                                <Badge variant="secondary" className="text-xs">Researcher</Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-xs">Patient</Badge>
                                            )}
                                        </div>
                                        <CardDescription className="truncate">
                                            {user.role === 'researcher' ? (
                                                <span className="flex items-center gap-1">
                                                    <Briefcase className="h-3 w-3" /> {user.institution}
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1">
                                                    Member since {new Date().getFullYear()}
                                                </span>
                                            )}
                                        </CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <div className="space-y-3">
                                        {user.bio && (
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {user.bio}
                                            </p>
                                        )}

                                        <div className="flex flex-wrap gap-1">
                                            {user.role === 'researcher' && user.expertise?.slice(0, 3).map((item, i) => (
                                                <Badge key={i} variant="secondary" className="text-xs font-normal">
                                                    {item}
                                                </Badge>
                                            ))}
                                            {user.role === 'patient' && user.conditions?.slice(0, 3).map((item, i) => (
                                                <Badge key={i} variant="secondary" className="text-xs font-normal">
                                                    {item}
                                                </Badge>
                                            ))}
                                            {(user.expertise?.length || 0) > 3 && (
                                                <Badge variant="secondary" className="text-xs font-normal">+{user.expertise!.length - 3}</Badge>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-2">
                                    {user.connectionStatus === 'connected' ? (
                                        <Button
                                            className="w-full"
                                            variant="outline"
                                            onClick={() => handleMessage(user._id)}
                                            disabled={messagingUserId === user._id}
                                        >
                                            {messagingUserId === user._id ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Opening...
                                                </>
                                            ) : (
                                                <>
                                                    <MessageSquare className="mr-2 h-4 w-4" /> Message
                                                </>
                                            )}
                                        </Button>
                                    ) : user.connectionStatus === 'pending_sent' ? (
                                        <div className="flex space-x-2">
                                            <Button className="flex-1" variant="secondary" disabled>
                                                <Clock className="mr-2 h-4 w-4" /> Pending
                                            </Button>
                                            <Button
                                                className="flex-1"
                                                variant="outline"
                                                onClick={() => handleCancelRequest(user.connectionId!)}
                                                disabled={isSending}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    ) : user.connectionStatus === 'pending_received' ? (
                                        isSending ? (
                                            <Button className="w-full" variant="outline" disabled>
                                                <Clock className="mr-2 h-4 w-4" /> Pending
                                            </Button>
                                        ) : (
                                            <div className="flex space-x-2">
                                                <Button className="w-full" variant="default" onClick={() => window.location.href = '/dashboard/researcher/collaborations'}>
                                                    <UserPlus className="mr-2 h-4 w-4" /> Respond
                                                </Button>
                                                <Button className="w-full" variant="destructive" onClick={() => handleDecline(user.connectionId!)} disabled={isSending}>
                                                    Decline
                                                </Button>
                                            </div>
                                        )
                                    ) : (
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button className="w-full" onClick={() => setConnectingUser(user)}>
                                                    <UserPlus className="mr-2 h-4 w-4" /> Connect
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Connect with {user.firstName}</DialogTitle>
                                                    <DialogDescription>
                                                        Send a personalized message to introduce yourself.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-4 py-4">
                                                    <div className="space-y-2">
                                                        <Label>Message (Optional)</Label>
                                                        <Textarea
                                                            placeholder={`Hi ${user.firstName}, I'd like to connect...`}
                                                            value={connectMessage}
                                                            onChange={(e) => setConnectMessage(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button variant="outline" onClick={() => setConnectingUser(null)}>Cancel</Button>
                                                    <Button onClick={handleConnect} disabled={isSending}>
                                                        {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                        Send Request
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    )}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div >
    );
}
