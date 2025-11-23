'use client';

import { format } from 'date-fns';

interface MessageBubbleProps {
  message: {
    _id: string;
    senderId: string;
    content: string;
    createdAt: Date;
    read: boolean;
  };
  isCurrentUser: boolean;
  showAvatar?: boolean;
  senderName?: string;
}

export function MessageBubble({ 
  message, 
  isCurrentUser, 
  showAvatar = false,
  senderName 
}: MessageBubbleProps) {
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isCurrentUser && showAvatar && (
        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-2 flex-shrink-0">
          <span className="text-blue-800 dark:text-blue-200 text-xs font-medium">
            {senderName?.charAt(0) || 'U'}
          </span>
        </div>
      )}
      
      <div className={`max-w-xs md:max-w-md lg:max-w-lg ${isCurrentUser ? 'mr-2' : 'ml-2'}`}>
        {!isCurrentUser && senderName && (
          <div className="text-xs text-gray-500 mb-1 ml-2">{senderName}</div>
        )}
        
        <div className={`rounded-2xl px-4 py-2 ${
          isCurrentUser 
            ? 'bg-blue-500 text-white rounded-tr-none' 
            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none'
        }`}>
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
        
        <div className={`text-xs text-gray-500 mt-1 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
          {format(new Date(message.createdAt), 'h:mm a')}
          {isCurrentUser && (
            <span className="ml-1">
              {message.read ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>
      
      {isCurrentUser && showAvatar && (
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center ml-2 flex-shrink-0">
          <span className="text-white text-xs font-medium">You</span>
        </div>
      )}
    </div>
  );
}