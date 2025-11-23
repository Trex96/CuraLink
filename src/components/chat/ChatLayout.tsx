'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useSocket } from '@/components/providers/SocketProvider';
import { ConversationList } from '@/components/chat/ConversationList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { Conversation, Message } from '@/types/chat';
import { useToast } from '@/components/ui/use-toast';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { cn } from '@/lib/utils/utils';

export function ChatLayout() {
    const { data: session } = useSession();
    const { socket, isConnected } = useSocket();
    const { refreshUnreadCount, decrementUnreadCount } = useUnreadMessages();
    const searchParams = useSearchParams();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
    const [typingUsers, setTypingUsers] = useState<Map<string, Set<string>>>(new Map());
    const [showArchived, setShowArchived] = useState(false);
    const { toast } = useToast();

    const userId = (session?.user as { id?: string })?.id;

    // Filter conversations based on archive status
    const filteredConversations = conversations.filter(c =>
        showArchived ? c.isArchived : !c.isArchived
    );

    // Fetch conversations
    const fetchConversations = useCallback(async () => {
        try {
            const response = await fetch('/api/messages/conversations');
            if (!response.ok) throw new Error('Failed to fetch conversations');
            const data = await response.json();
            setConversations(data);
        } catch (error) {
            console.error('Error fetching conversations:', error);
            toast({
                title: 'Error',
                description: 'Failed to load conversations',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    // Fetch messages for selected conversation
    const fetchMessages = useCallback(async (conversationId: string) => {
        setLoadingMessages(true);
        try {
            const response = await fetch(`/api/messages/${conversationId}`);
            if (!response.ok) throw new Error('Failed to fetch messages');
            const data = await response.json();
            setMessages(data);

            // Mark messages as read via API to ensure persistence
            const hasUnread = data.some((m: Message) => !m.read && m.senderId !== userId);
            if (hasUnread) {
                try {
                    const readResponse = await fetch('/api/messages/mark-read', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ conversationId })
                    });
                    const readData = await readResponse.json();

                    if (readData.success) {
                        // Update local conversation state
                        setConversations(prev => prev.map(c => {
                            if (c.collaborationId === conversationId) {
                                return { ...c, unreadCount: 0 };
                            }
                            return c;
                        }));

                        // Update local messages state
                        setMessages(prev => prev.map(m => {
                            if (!m.read && m.senderId !== userId) {
                                return { ...m, read: true };
                            }
                            return m;
                        }));

                        // Trigger global unread count refresh via context
                        refreshUnreadCount();
                    }
                } catch (error) {
                    console.error('Error marking messages as read:', error);
                }

                // Send read receipts via socket for real-time updates to the sender
                if (socket && isConnected) {
                    const unreadMessages = data.filter((m: Message) => !m.read && m.senderId !== userId);
                    unreadMessages.forEach((m: Message) => {
                        socket.emit('message-read', {
                            messageId: m._id,
                            conversationId: m.collaborationId,
                            userId
                        });
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast({
                title: 'Error',
                description: 'Failed to load messages',
                variant: 'destructive',
            });
        } finally {
            setLoadingMessages(false);
        }
    }, [toast, socket, isConnected, userId]);

    // Initial load
    useEffect(() => {
        if (session?.user) {
            fetchConversations();
        }
    }, [session, fetchConversations]);

    // Handle conversation query parameter from URL
    useEffect(() => {
        const conversationId = searchParams?.get('conversation');
        if (conversationId && conversations.length > 0) {
            // Check if this conversation exists in the list
            const exists = conversations.find(c => c.collaborationId === conversationId);
            if (exists) {
                setSelectedConversationId(conversationId);
            }
        }
    }, [searchParams, conversations]);

    // Handle conversation selection
    useEffect(() => {
        if (selectedConversationId) {
            console.log('📂 Selected conversation changed:', selectedConversationId);

            // Optimistic update: clear unread count for this conversation immediately
            const conversation = conversations.find(c => c.collaborationId === selectedConversationId);
            if (conversation && conversation.unreadCount > 0) {
                // Decrement global count
                decrementUnreadCount(conversation.unreadCount);

                // Update local state
                setConversations(prev => prev.map(c => {
                    if (c.collaborationId === selectedConversationId) {
                        return { ...c, unreadCount: 0 };
                    }
                    return c;
                }));
            }

            fetchMessages(selectedConversationId);

            // Join room (and leave previous)
            if (socket && isConnected) {
                console.log('🚪 Joining chat room:', selectedConversationId);
                socket.emit('join-room', selectedConversationId);

                return () => {
                    console.log('👋 Leaving chat room:', selectedConversationId);
                    socket.emit('leave-room', selectedConversationId);
                };
            } else {
                console.warn('⚠️ Cannot join room - socket:', !!socket, 'connected:', isConnected);
            }
        }
    }, [selectedConversationId, fetchMessages, socket, isConnected, conversations, decrementUnreadCount]);

    // Socket event listeners
    useEffect(() => {
        if (!socket || !isConnected || !userId) return;

        console.log('🔌 Setting up socket listeners for userId:', userId);

        // Join as user to track online status
        socket.emit('user-join', userId);
        console.log('👤 Emitted user-join for userId:', userId);

        const handleNewMessage = (message: Message) => {
            console.log('📩 NEW MESSAGE RECEIVED:', message);

            // Convert both to strings for comparison to avoid type mismatches
            const messageCollabId = String(message.collaborationId);
            const selectedCollabId = String(selectedConversationId || '');

            // If message belongs to current conversation, add it
            if (messageCollabId === selectedCollabId) {
                console.log('✅ Message matches current conversation, adding to UI');
                setMessages((prev) => {
                    // Check if we have an optimistic message that matches this one
                    const optimisticIndex = prev.findIndex(m =>
                        m.senderId === message.senderId &&
                        m.content === message.content &&
                        m.status === 'sent' &&
                        !m._id.match(/^[0-9a-fA-F]{24}$/)
                    );

                    if (optimisticIndex !== -1) {
                        console.log('🔄 Replacing optimistic message at index:', optimisticIndex);
                        const newMessages = [...prev];
                        newMessages[optimisticIndex] = message;
                        return newMessages;
                    }

                    if (prev.some(m => m._id === message._id)) {
                        console.log('⚠️ Message already exists, skipping');
                        return prev;
                    }

                    console.log('➕ Adding new message to UI');
                    return [...prev, message];
                });

                // Mark as read immediately if we are viewing this conversation
                if (message.senderId !== userId) {
                    socket.emit('mark-read', {
                        messageId: message._id,
                        conversationId: message.collaborationId,
                        userId,
                        senderId: message.senderId
                    });
                }
            } else {
                console.log('❌ Message does NOT match current conversation');
            }

            // Update conversation list (last message, unread count, auto-unarchive)
            setConversations((prev) => {
                const updated = prev.map((conv) => {
                    if (conv.collaborationId === message.collaborationId) {
                        return {
                            ...conv,
                            lastMessage: message.attachments && message.attachments.length > 0 ? 'Attachment' : message.content,
                            lastMessageTime: message.createdAt,
                            unreadCount: message.senderId !== userId && message.collaborationId !== selectedConversationId
                                ? (conv.unreadCount || 0) + 1
                                : conv.unreadCount,
                            isArchived: false // Auto-unarchive on new message
                        };
                    }
                    return conv;
                });
                return updated.sort((a, b) => {
                    const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
                    const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
                    return timeB - timeA;
                });
            });
        };

        const handleMessageUpdated = (updatedMessage: Message) => {
            setMessages((prev) => prev.map(m =>
                m._id === updatedMessage._id ? updatedMessage : m
            ));
        };

        const handleUserOnline = (onlineUserId: string) => {
            setOnlineUsers(prev => new Set(prev).add(onlineUserId));
        };

        const handleUserOffline = (offlineUserId: string) => {
            setOnlineUsers(prev => {
                const next = new Set(prev);
                next.delete(offlineUserId);
                return next;
            });
        };

        const handleOnlineUsers = (users: string[]) => {
            setOnlineUsers(new Set(users));
        };

        const handleTypingStart = (data: { collaborationId: string; userId: string }) => {
            setTypingUsers(prev => {
                const next = new Map(prev);
                const users = next.get(data.collaborationId) || new Set();
                users.add(data.userId);
                next.set(data.collaborationId, users);
                return next;
            });
        };

        const handleTypingStop = (data: { collaborationId: string; userId: string }) => {
            setTypingUsers(prev => {
                const next = new Map(prev);
                const users = next.get(data.collaborationId);
                if (users) {
                    users.delete(data.userId);
                    if (users.size === 0) {
                        next.delete(data.collaborationId);
                    } else {
                        next.set(data.collaborationId, users);
                    }
                }
                return next;
            });
        };

        const handleMessageReadUpdate = (data: { messageId: string; collaborationId: string; readBy: string }) => {
            if (data.collaborationId === selectedConversationId) {
                setMessages(prev => prev.map(m => {
                    if (m._id === data.messageId) {
                        return { ...m, status: 'read', read: true };
                    }
                    return m;
                }));
            }
        };

        const handleSocketError = (error: { message: string }) => {
            console.error('Socket error:', error);
            toast({
                title: 'Error',
                description: error.message || 'An error occurred with the messaging server',
                variant: 'destructive',
            });
        };

        socket.on('new-message', handleNewMessage);
        socket.on('message-updated', handleMessageUpdated);
        socket.on('user-online', handleUserOnline);
        socket.on('user-offline', handleUserOffline);
        socket.on('online-users', handleOnlineUsers);
        socket.on('typing-start', handleTypingStart);
        socket.on('typing-stop', handleTypingStop);
        socket.on('message-read', handleMessageReadUpdate);
        socket.on('error', handleSocketError);

        return () => {
            socket.off('new-message', handleNewMessage);
            socket.off('message-updated', handleMessageUpdated);
            socket.off('user-online', handleUserOnline);
            socket.off('user-offline', handleUserOffline);
            socket.off('online-users', handleOnlineUsers);
            socket.off('typing-start', handleTypingStart);
            socket.off('typing-stop', handleTypingStop);
            socket.off('message-read', handleMessageReadUpdate);
            socket.off('error', handleSocketError);
        };
    }, [socket, isConnected, selectedConversationId, userId, toast]);

    const handleSendMessage = async (content: string, attachments: { url: string; type: 'image' | 'video' | 'file'; name: string }[] = [], replyToId?: string) => {
        if (!selectedConversationId || !userId) return;

        const selectedConv = conversations.find(c => c.collaborationId === selectedConversationId);
        if (!selectedConv) return;

        const receiverId = selectedConv.requesterId === userId ? selectedConv.receiverId : selectedConv.requesterId;

        if (socket && isConnected) {
            const tempId = Date.now().toString();
            const optimisticMessage: Message = {
                _id: tempId,
                senderId: userId,
                receiverId,
                content,
                collaborationId: selectedConversationId,
                status: 'sent',
                read: false,
                type: 'text',
                replyTo: replyToId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                attachments
            };

            setMessages((prev) => [...prev, optimisticMessage]);

            try {
                socket.emit('send-message', {
                    senderId: userId,
                    receiverId,
                    content,
                    collaborationId: selectedConversationId,
                    conversationId: selectedConversationId,
                    attachments,
                    replyTo: replyToId
                });
            } catch (error) {
                console.error('❌ Error during socket.emit:', error);
            }

            setConversations((prev) => {
                const updated = prev.map((conv) => {
                    if (conv.collaborationId === selectedConversationId) {
                        return {
                            ...conv,
                            lastMessage: attachments.length > 0 ? (content || 'Sent an attachment') : content,
                            lastMessageTime: new Date().toISOString(),
                            isArchived: false // Auto-unarchive on send
                        };
                    }
                    return conv;
                });
                return updated.sort((a, b) => {
                    const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
                    const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
                    return timeB - timeA;
                });
            });
        } else {
            toast({
                title: 'Error',
                description: 'Not connected to messaging server. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleDeleteMessage = async (messageId: string) => {
        try {
            const response = await fetch(`/api/messages/${messageId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete message');

            setMessages((prev) => prev.filter(m => m._id !== messageId));
            toast({
                title: 'Success',
                description: 'Message deleted',
            });
        } catch (error) {
            console.error('Error deleting message:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete message',
                variant: 'destructive',
            });
        }
    };

    const handleArchiveConversation = async (conversationId: string) => {
        try {
            const response = await fetch(`/api/messages/conversations/${conversationId}/archive`, {
                method: 'PATCH',
            });

            if (!response.ok) throw new Error('Failed to archive conversation');

            setConversations((prev) => prev.map(c => {
                if (c.collaborationId === conversationId) {
                    return { ...c, isArchived: true };
                }
                return c;
            }));

            if (selectedConversationId === conversationId) {
                setSelectedConversationId(null);
            }

            toast({
                title: 'Success',
                description: 'Conversation archived',
            });
        } catch (error) {
            console.error('Error archiving conversation:', error);
            toast({
                title: 'Error',
                description: 'Failed to archive conversation',
                variant: 'destructive',
            });
        }
    };

    const handleUnarchiveConversation = async (conversationId: string) => {
        try {
            const response = await fetch(`/api/messages/conversations/${conversationId}/archive`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'unarchive' })
            });

            if (!response.ok) throw new Error('Failed to unarchive conversation');

            setConversations((prev) => prev.map(c => {
                if (c.collaborationId === conversationId) {
                    return { ...c, isArchived: false };
                }
                return c;
            }));

            toast({
                title: 'Success',
                description: 'Conversation unarchived',
            });
        } catch (error) {
            console.error('Error unarchiving conversation:', error);
            toast({
                title: 'Error',
                description: 'Failed to unarchive conversation',
                variant: 'destructive',
            });
        }
    };

    const handleTyping = (isTyping: boolean) => {
        if (socket && isConnected && selectedConversationId && userId) {
            const event = isTyping ? 'typing-start' : 'typing-stop';
            socket.emit(event, { conversationId: selectedConversationId, userId });
        }
    };

    if (!session) return null;

    const selectedConversation = conversations.find(c => c.collaborationId === selectedConversationId);
    const otherUserId = selectedConversation
        ? (selectedConversation.requesterId === userId ? selectedConversation.receiverId : selectedConversation.requesterId)
        : null;

    const isOtherUserOnline = otherUserId ? onlineUsers.has(otherUserId) : false;
    const isOtherUserTyping = selectedConversationId
        ? typingUsers.get(selectedConversationId)?.has(otherUserId || '')
        : false;

    return (
        <div className="flex h-[calc(100vh-4rem)] bg-background border rounded-lg overflow-hidden shadow-sm">
            <div className={cn(
                "w-full md:w-80 lg:w-96 border-r flex flex-col bg-card",
                selectedConversationId ? "hidden md:flex" : "flex"
            )}>
                <ConversationList
                    conversations={filteredConversations}
                    selectedId={selectedConversationId}
                    onSelect={setSelectedConversationId}
                    loading={loading}
                    currentUserId={userId}
                    onlineUsers={onlineUsers}
                    typingUsers={typingUsers}
                    showArchived={showArchived}
                    onToggleArchived={() => setShowArchived(!showArchived)}
                />
            </div>
            <div className={cn(
                "flex-1 flex-col bg-background",
                selectedConversationId ? "flex" : "hidden md:flex"
            )}>
                {selectedConversationId && selectedConversation ? (
                    <ChatWindow
                        conversation={selectedConversation}
                        messages={messages}
                        currentUserId={userId!}
                        onSendMessage={handleSendMessage}
                        loading={loadingMessages}
                        onDeleteMessage={handleDeleteMessage}
                        onArchiveConversation={handleArchiveConversation}
                        onUnarchiveConversation={handleUnarchiveConversation}
                        isArchived={selectedConversation.isArchived}
                        onTyping={handleTyping}
                        isOnline={isOtherUserOnline}
                        isTyping={isOtherUserTyping}
                        onBack={() => setSelectedConversationId(null)}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground bg-muted/10">
                        <div className="text-center">
                            <h3 className="text-lg font-medium">Select a conversation</h3>
                            <p className="text-sm">Choose a chat from the left to start messaging</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
