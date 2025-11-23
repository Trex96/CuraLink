'use client';

import { useUnreadMessagesContext } from '@/context/UnreadMessagesContext';

export function useUnreadMessages() {
    const context = useUnreadMessagesContext();
    return context;
}
