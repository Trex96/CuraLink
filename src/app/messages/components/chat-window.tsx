'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { MessageBubble } from './message-bubble';
import { MessageInput } from './message-input';
import { TypingIndicator } from './typing-indicator';
import { OnlineStatus } from './online-status';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MoreVertical } from 'lucide-react';

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: string;
  // Add other message properties as needed
}

interface ChatWindowProps {
  conversation: {
    collaborationId: string;
    requesterId: string;
    receiverId: string;
    requesterName: string;
    receiverName: string;
    requesterInstitution: string;
    receiverInstitution: string;
  } | null;
  messages: Message[];
  onSendMessage: (content: string) => void;
  onBack: () => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
  onMarkAsRead: (messageId: string) => void;
}

export function ChatWindow({ 
  conversation, 
  messages, 
  onSendMessage, 
  onBack, 
  onTypingStart, 
  onTypingStop,
  onMarkAsRead
}: ChatWindowProps) {
  const { user } = useAuth();
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const otherUser = conversation 
    ? user?.id === conversation.requesterId 
      ? { id: conversation.receiverId, name: conversation.receiverName, institution: conversation.receiverInstitution }
      : { id: conversation.requesterId, name: conversation.requesterName, institution: conversation.requesterInstitution }
    : null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mark unread messages as read when chat window opens
  useEffect(() => {
    if (conversation && messages.length > 0) {
      messages.forEach(message => {
        if (!message.read && message.receiverId === user?.id) {
          onMarkAsRead(message._id);
        }
      });
    }
  }, [conversation, messages, user?.id, onMarkAsRead]);

  // In a real implementation, this would come from socket events
  useEffect(() => {
    // Simulate typing indicator
    const typingTimer = setTimeout(() => {
      setIsTyping(false);
    }, 3000);
    
    return () => clearTimeout(typingTimer);
  }, [isTyping]);

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
          <div className="w-12 h-12 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
        </div>
        <h3 className="text-xl font-medium mb-2">Welcome to Messages</h3>
        <p className="text-gray-500 mb-6">
          Select a conversation from the sidebar to start messaging
        </p>
        <Button onClick={onBack}>
          View Conversations
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden mr-2"
          onClick={onBack}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <span className="text-blue-800 dark:text-blue-200 font-medium">
                {otherUser?.name.charAt(0) || 'U'}
              </span>
            </div>
            <OnlineStatus 
              isOnline={true} // In real implementation, this would come from socket
              className="absolute bottom-0 right-0"
            />
          </div>
          
          <div className="ml-3">
            <h3 className="font-medium">{otherUser?.name}</h3>
            <p className="text-sm text-gray-500 truncate max-w-xs">
              {otherUser?.institution}
            </p>
          </div>
        </div>
        
        <Button variant="ghost" size="icon" className="ml-auto">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message, index) => {
            const isCurrentUser = message.senderId === user?.id;
            const showAvatar = index === 0 || 
              messages[index - 1].senderId !== message.senderId ||
              new Date(message.createdAt).getTime() - new Date(messages[index - 1].createdAt).getTime() > 300000; // 5 minutes
            
            return (
              <MessageBubble
                key={message._id}
                message={{
                  ...message,
                  createdAt: new Date(message.createdAt)
                }}
                isCurrentUser={isCurrentUser}
                showAvatar={showAvatar}
                senderName={isCurrentUser ? undefined : otherUser?.name}
              />
            );
          })}
          
          <TypingIndicator 
            isTyping={isTyping} 
          />
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Message Input */}
      <MessageInput
        onSendMessage={onSendMessage}
        onTypingStart={onTypingStart}
        onTypingStop={onTypingStop}
        disabled={!conversation}
      />
    </div>
  );
}