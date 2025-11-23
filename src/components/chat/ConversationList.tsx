'use client';

import { useState } from 'react';
import { Conversation } from '@/types/chat';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface ConversationListProps {
    conversations: Conversation[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    loading: boolean;
    currentUserId?: string;
    onlineUsers?: Set<string>;
    typingUsers?: Map<string, Set<string>>;
    showArchived?: boolean;
    onToggleArchived?: () => void;
}

export function ConversationList({
    conversations,
    selectedId,
    onSelect,
    loading,
    currentUserId,
    onlineUsers = new Set(),
    typingUsers = new Map(),
    showArchived = false,
    onToggleArchived
}: ConversationListProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredConversations = conversations.filter(conv => {
        const otherName = conv.requesterId === currentUserId ? conv.receiverName : conv.requesterName;
        return otherName.toLowerCase().includes(searchQuery.toLowerCase());
    });

    if (loading) {
        return (
            <div className="flex flex-col h-full bg-background">
                <div className="p-4 border-b bg-background">
                    <Skeleton className="h-10 w-full rounded-lg" />
                </div>
                <div className="flex-1 p-2 space-y-1">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
                            <Skeleton className="h-14 w-14 rounded-full flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-background">
            <div className="p-4 border-b bg-background sticky top-0 z-10 space-y-3">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                        placeholder="Search chats..."
                        className="pl-10 bg-muted/30 border-muted focus-visible:bg-background transition-colors rounded-xl"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {onToggleArchived && (
                    <button
                        onClick={onToggleArchived}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-colors"
                    >
                        <span className="flex items-center gap-2">
                            <span className="h-4 w-4 flex items-center justify-center">
                                {showArchived ? '←' : '📁'}
                            </span>
                            {showArchived ? 'Back to Chats' : 'Archived Chats'}
                        </span>
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin">
                {filteredConversations.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
                            <Search className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium text-foreground mb-1">No conversations found</p>
                        <p className="text-xs text-muted-foreground">
                            {searchQuery ? 'Try a different search' : 'Start a new conversation'}
                        </p>
                    </div>
                ) : (
                    <div className="p-2 space-y-1">
                        {filteredConversations.map((conv) => {
                            const isSelected = conv.collaborationId === selectedId;
                            const otherName = conv.requesterId === currentUserId ? conv.receiverName : conv.requesterName;
                            const otherUserId = conv.requesterId === currentUserId ? conv.receiverId : conv.requesterId;
                            const isOnline = onlineUsers.has(otherUserId);
                            const isTyping = typingUsers.get(conv.collaborationId)?.has(otherUserId);

                            return (
                                <div
                                    key={conv.collaborationId}
                                    onClick={() => onSelect(conv.collaborationId)}
                                    className={cn(
                                        "group flex items-start gap-3 p-3 cursor-pointer transition-all duration-200 rounded-xl",
                                        "hover:bg-accent/60 active:scale-[0.98]",
                                        isSelected && "bg-accent shadow-sm"
                                    )}
                                >
                                    <div className="relative flex-shrink-0">
                                        <div className={cn(
                                            "h-14 w-14 rounded-full flex items-center justify-center font-semibold text-lg transition-transform",
                                            "bg-gradient-to-br from-primary/20 to-primary/10 text-primary",
                                            "group-hover:scale-105"
                                        )}>
                                            {otherName.charAt(0).toUpperCase()}
                                        </div>

                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <h3 className={cn(
                                                "font-semibold truncate text-sm",
                                                conv.unreadCount > 0 ? "text-foreground" : "text-foreground/90"
                                            )}>
                                                {otherName}
                                            </h3>
                                            {conv.lastMessageTime && (
                                                <span className={cn(
                                                    "text-[10px] flex-shrink-0 ml-2",
                                                    conv.unreadCount > 0 ? "text-primary font-medium" : "text-muted-foreground"
                                                )}>
                                                    {formatDistanceToNow(new Date(conv.lastMessageTime), { addSuffix: false }).replace(' ago', '')}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex justify-between items-center gap-2">
                                            <p className={cn(
                                                "text-[13px] truncate flex-1",
                                                isTyping && "text-primary italic",
                                                !isTyping && conv.unreadCount > 0 && "font-medium text-foreground",
                                                !isTyping && conv.unreadCount === 0 && "text-muted-foreground"
                                            )}>
                                                {isTyping ? (
                                                    <span className="flex items-center gap-1">
                                                        typing
                                                        <span className="flex gap-0.5">
                                                            <span className="animate-bounce h-1 w-1 bg-primary rounded-full" style={{ animationDelay: '0ms' }}></span>
                                                            <span className="animate-bounce h-1 w-1 bg-primary rounded-full" style={{ animationDelay: '150ms' }}></span>
                                                            <span className="animate-bounce h-1 w-1 bg-primary rounded-full" style={{ animationDelay: '300ms' }}></span>
                                                        </span>
                                                    </span>
                                                ) : (
                                                    conv.lastMessage || <span className="italic text-muted-foreground/70">No messages yet</span>
                                                )}
                                            </p>

                                            {conv.unreadCount > 0 && (
                                                <span className="flex h-5 min-w-[20px] px-1.5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex-shrink-0 shadow-sm">
                                                    {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
