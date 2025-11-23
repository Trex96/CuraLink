'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Building2,
    Mail,
    Calendar,
    MessageSquare,
    UserCheck,
    UserPlus,
    Briefcase,
    GraduationCap
} from 'lucide-react';

interface ProfileDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: {
        _id: string;
        name: string;
        role: 'researcher' | 'patient';
        institution?: string;
        bio?: string;
        expertise?: string[];
        conditions?: string[];
        profilePicture?: string;
        email?: string;
        memberSince?: string;
    };
    connectionStatus?: 'none' | 'pending_sent' | 'pending_received' | 'connected';
    onConnect?: () => void;
    onMessage?: () => void;
    onAccept?: () => void;
    onDecline?: () => void;
}

export function ProfileDialog({
    open,
    onOpenChange,
    user,
    connectionStatus = 'none',
    onConnect,
    onMessage,
    onAccept,
    onDecline
}: ProfileDialogProps) {
    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="sr-only">Profile - {user.name}</DialogTitle>
                </DialogHeader>

                {/* Header Section */}
                <div className="relative">
                    {/* Cover Photo */}
                    <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 rounded-t-lg -mx-6 -mt-6"></div>

                    {/* Profile Picture */}
                    <div className="flex items-end gap-6 px-6 -mt-16">
                        <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                            <AvatarImage src={user.profilePicture} alt={user.name} />
                            <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/20 text-primary text-3xl font-semibold">
                                {getInitials(user.name)}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 pb-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold">{user.name}</h2>
                                    {user.institution && (
                                        <p className="text-muted-foreground flex items-center gap-1.5 mt-1">
                                            {user.role === 'researcher' ? (
                                                <Briefcase className="h-4 w-4" />
                                            ) : (
                                                <GraduationCap className="h-4 w-4" />
                                            )}
                                            {user.institution}
                                        </p>
                                    )}
                                </div>
                                <Badge variant={user.role === 'researcher' ? 'secondary' : 'outline'}>
                                    {user.role === 'researcher' ? 'Researcher' : 'Patient'}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 px-6">
                    {connectionStatus === 'connected' && onMessage && (
                        <Button className="flex-1" onClick={onMessage}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Message
                        </Button>
                    )}
                    {connectionStatus === 'pending_received' && onAccept && onDecline && (
                        <>
                            <Button className="flex-1" onClick={onAccept}>
                                <UserCheck className="h-4 w-4 mr-2" />
                                Accept Request
                            </Button>
                            <Button className="flex-1" variant="outline" onClick={onDecline}>
                                Decline
                            </Button>
                        </>
                    )}
                    {connectionStatus === 'none' && onConnect && (
                        <Button className="flex-1" onClick={onConnect}>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Connect
                        </Button>
                    )}
                    {connectionStatus === 'pending_sent' && (
                        <Button className="flex-1" variant="secondary" disabled>
                            Request Pending
                        </Button>
                    )}
                </div>

                <Separator />

                {/* Profile Content */}
                <div className="space-y-6 px-6 pb-6">
                    {/* Bio */}
                    {user.bio && (
                        <div>
                            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                                About
                            </h3>
                            <p className="text-sm leading-relaxed">{user.bio}</p>
                        </div>
                    )}

                    {/* Expertise or Conditions */}
                    {((user.role === 'researcher' && user.expertise && user.expertise.length > 0) ||
                        (user.role === 'patient' && user.conditions && user.conditions.length > 0)) && (
                            <div>
                                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                                    {user.role === 'researcher' ? 'Research Expertise' : 'Health Conditions'}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {(user.role === 'researcher' ? user.expertise : user.conditions)?.map((item, i) => (
                                        <Badge key={i} variant="secondary" className="text-sm">
                                            {item}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                    {/* Contact Info */}
                    <div>
                        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                            Contact Information
                        </h3>
                        <div className="space-y-2">
                            {user.email && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Email:</span>
                                    <a href={`mailto:${user.email}`} className="text-primary hover:underline">
                                        {user.email}
                                    </a>
                                </div>
                            )}
                            {user.institution && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Institution:</span>
                                    <span>{user.institution}</span>
                                </div>
                            )}
                            {user.memberSince && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Member since:</span>
                                    <span>{new Date(user.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
