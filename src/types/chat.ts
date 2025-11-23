export interface Message {
    _id: string;
    senderId: string;
    receiverId: string;
    content: string;
    collaborationId: string;
    status: 'sent' | 'delivered' | 'read';
    read: boolean; // Deprecated but kept for compatibility
    type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'system';
    replyTo?: Message | string; // Can be populated or ID
    reactions?: {
        emoji: string;
        userId: string;
    }[];
    metadata?: {
        size?: number;
        duration?: number;
        mimeType?: string;
        fileName?: string;
    };
    deletedFor?: string[];
    attachments?: {
        url: string;
        type: 'image' | 'video' | 'file';
        name: string;
    }[];
    createdAt: string;
    updatedAt: string;
}

export interface Conversation {
    collaborationId: string;
    requesterId: string;
    receiverId: string;
    requesterName: string;
    receiverName: string;
    requesterInstitution: string;
    receiverInstitution: string;
    lastMessage?: string;
    lastMessageTime?: string;
    unreadCount: number;
    isArchived: boolean;
    isPinned?: boolean;
    isMuted?: boolean;
    wallpaper?: {
        userId: string;
        url: string;
    }[];
}

export interface ChatUser {
    _id: string;
    name: string;
    image?: string;
}
