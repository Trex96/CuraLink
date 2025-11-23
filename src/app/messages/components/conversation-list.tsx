'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ConversationData } from '@/lib/services/messages';
import { formatDistanceToNow } from 'date-fns';

interface OnlineStatusProps {
  isOnline: boolean;
  className?: string;
}

function OnlineStatus({ isOnline, className = '' }: OnlineStatusProps) {
  return (
    <div className={`relative ${className}`}>
      <div className={`w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${
        isOnline ? 'bg-green-500' : 'bg-gray-400'
      }`}>
      </div>
    </div>
  );
}

interface ConversationListProps {
  conversations: ConversationData[];
  onSelectConversation: (conversationId: string) => void;
  selectedConversationId: string | null;
}

export function ConversationList({ 
  conversations, 
  onSelectConversation, 
  selectedConversationId 
}: ConversationListProps) {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  // In a real implementation, this would come from socket events
  useEffect(() => {
    // Simulate online users
    const updateOnlineUsers = () => {
      const onlineUserIds = new Set<string>();
      conversations.forEach(conv => {
        // Randomly mark some users as online for demo
        if (Math.random() > 0.5) {
          onlineUserIds.add(conv.requesterId);
          onlineUserIds.add(conv.receiverId);
        }
      });
      setOnlineUsers(onlineUserIds);
    };
    
    updateOnlineUsers();
    
    // In a real implementation, we would listen to socket events instead
    // const interval = setInterval(updateOnlineUsers, 30000); // Update every 30 seconds
    // return () => clearInterval(interval);
  }, [conversations]);

  const getOtherUser = (conversation: ConversationData) => {
    if (!user) return null;
    return user.id === conversation.requesterId ? 
      { 
        id: conversation.receiverId, 
        name: conversation.receiverName, 
        institution: conversation.receiverInstitution 
      } : 
      { 
        id: conversation.requesterId, 
        name: conversation.requesterName, 
        institution: conversation.requesterInstitution 
      };
  };

  return (
    <div className="w-full md:w-80 lg:w-96 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold">Messages</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>No conversations yet</p>
            <p className="text-sm mt-2">Collaborate with other researchers to start messaging</p>
          </div>
        ) : (
          <ul>
            {conversations.map((conversation) => {
              const otherUser = getOtherUser(conversation);
              if (!otherUser) return null;
              
              const isSelected = selectedConversationId === conversation.collaborationId;
              
              return (
                <li 
                  key={conversation.collaborationId}
                  className={`border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    isSelected ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                  }`}
                  onClick={() => onSelectConversation(conversation.collaborationId)}
                >
                  <div className="p-4 flex items-center">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <span className="text-blue-800 dark:text-blue-200 font-medium">
                          {otherUser.name.charAt(0)}
                        </span>
                      </div>
                      <OnlineStatus 
                        isOnline={onlineUsers.has(otherUser.id)} 
                        className="absolute bottom-0 right-0"
                      />
                    </div>
                    
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex justify-between">
                        <h3 className="font-medium truncate">{otherUser.name}</h3>
                        {conversation.lastMessageTime && (
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(conversation.lastMessageTime), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-500 truncate">
                        {otherUser.institution}
                      </p>
                      
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-sm truncate text-gray-600 dark:text-gray-400">
                          {conversation.lastMessage || 'No messages yet'}
                        </p>
                        
                        {conversation.unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}