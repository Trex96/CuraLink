'use client';

interface OnlineStatusProps {
  isOnline: boolean;
  className?: string;
}

export function OnlineStatus({ isOnline, className = '' }: OnlineStatusProps) {
  return (
    <div className={`relative ${className}`}>
      <div className={`w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${
        isOnline ? 'bg-green-500' : 'bg-gray-400'
      }`}>
      </div>
    </div>
  );
}