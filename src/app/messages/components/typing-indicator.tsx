'use client';

interface TypingIndicatorProps {
  isTyping: boolean;
  userName?: string;
}

export function TypingIndicator({ isTyping, userName }: TypingIndicatorProps) {
  if (!isTyping) return null;
  
  return (
    <div className="flex items-center p-2">
      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-2">
        <span className="text-gray-800 dark:text-gray-200 text-xs font-medium">
          {userName?.charAt(0) || 'U'}
        </span>
      </div>
      
      <div className="flex items-center">
        <span className="text-sm text-gray-500 mr-2">
          {userName ? `${userName} is` : 'Someone is'} typing
        </span>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
}