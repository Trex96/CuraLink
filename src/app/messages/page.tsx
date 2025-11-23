'use client';

import { ChatLayout } from '@/components/chat/ChatLayout';

export default function MessagesPage() {
  return (
    <div className="container py-8 h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">Chat with your research collaborators and patients.</p>
      </div>

      <ChatLayout />
    </div>
  );
}