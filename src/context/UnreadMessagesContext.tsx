'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useSocket } from '@/components/providers/SocketProvider';

interface UnreadMessagesContextType {
    unreadCount: number;
    updateUnreadCount: (count: number) => void;
    decrementUnreadCount: (amount: number) => void;
    incrementUnreadCount: () => void;
    refreshUnreadCount: () => Promise<void>;
}

const UnreadMessagesContext = createContext<UnreadMessagesContextType | undefined>(undefined);

export function UnreadMessagesProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const { socket, isConnected } = useSocket();
    const [unreadCount, setUnreadCount] = useState(0);

    const userId = (session?.user as { id?: string })?.id;

    // Fetch initial count
    const fetchUnreadCount = useCallback(async () => {
        if (!userId) return;

        try {
            const response = await fetch(`/api/messages/unread-count?userId=${userId}`);
            if (response.ok) {
                const data = await response.json();
                setUnreadCount(data.count || 0);
            }
        } catch (error) {
            console.error('Failed to fetch unread message count:', error);
        }
    }, [userId]);

    // Initial fetch
    useEffect(() => {
        fetchUnreadCount();
    }, [fetchUnreadCount]);

    // Socket listeners
    useEffect(() => {
        if (!socket || !isConnected || !userId) return;

        const handleNewMessage = (message: any) => {
            if (message.senderId !== userId) {
                // We rely on the ChatLayout to handle "read" status if the chat is open.
                // If the chat is NOT open (which we don't know here easily without more complex state),
                // we might increment. 
                // However, the server usually emits 'unread-messages-update' shortly after.
                // To be "snappy", we can increment optimistically, but we must be careful not to double count.
                // For now, let's rely on the specific unread-update event or increment if we know it's safe.
                // Actually, Telegram/WhatsApp style:
                // If I'm not in the chat, it increments.

                // Let's just listen for the explicit update event from the server which is the source of truth,
                // OR increment if we want instant feedback.
                // The server code I wrote emits 'unread-messages-update' to the receiver.
                // So we should just listen to that.
            }
        };

        const handleUnreadUpdate = (data: { count: number }) => {
            console.log('🔄 Global unread count updated via socket:', data.count);
            setUnreadCount(data.count);
        };

        const handleMessageRead = (data: { readBy: string }) => {
            if (data.readBy === userId) {
                // If *I* read a message (e.g. on another device), refresh.
                fetchUnreadCount();
            }
        };

        socket.on('unread-messages-update', handleUnreadUpdate);
        socket.on('message-read', handleMessageRead);

        return () => {
            socket.off('unread-messages-update', handleUnreadUpdate);
            socket.off('message-read', handleMessageRead);
        };
    }, [socket, isConnected, userId, fetchUnreadCount]);

    const updateUnreadCount = useCallback((count: number) => {
        setUnreadCount(count);
    }, []);

    const decrementUnreadCount = useCallback((amount: number) => {
        setUnreadCount(prev => Math.max(0, prev - amount));
    }, []);

    const incrementUnreadCount = useCallback(() => {
        setUnreadCount(prev => prev + 1);
    }, []);

    return (
        <UnreadMessagesContext.Provider value={{
            unreadCount,
            updateUnreadCount,
            decrementUnreadCount,
            incrementUnreadCount,
            refreshUnreadCount: fetchUnreadCount
        }}>
            {children}
        </UnreadMessagesContext.Provider>
    );
}

export function useUnreadMessagesContext() {
    const context = useContext(UnreadMessagesContext);
    if (context === undefined) {
        throw new Error('useUnreadMessagesContext must be used within a UnreadMessagesProvider');
    }
    return context;
}
