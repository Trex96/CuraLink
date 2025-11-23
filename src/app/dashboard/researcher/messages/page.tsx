'use client';

import { ChatLayout } from '@/components/chat/ChatLayout';

export default function ResearcherMessagesPage() {
    return (
        <div className="container py-8 h-[calc(100vh-4rem)] flex flex-col">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
                <p className="text-muted-foreground">Communicate with patients and colleagues.</p>
            </div>

            <ChatLayout />
        </div>
    );
}
