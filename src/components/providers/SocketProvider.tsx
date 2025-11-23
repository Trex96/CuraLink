'use client';

import * as React from 'react';
import socketClient from '../../lib/socket/client';
import { Socket } from 'socket.io-client';
import { useAuth } from '@/hooks/useAuth';

// Define TypeScript interfaces for our socket events
export interface SocketUser {
  userId: string;
  socketId: string;
  online: boolean;
}

export interface MessageData {
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  conversationId: string;
}

export interface TypingData {
  senderId: string;
  receiverId: string;
  isTyping: boolean;
}

export interface ReadReceiptData {
  messageId: string;
  readerId: string;
  readAt: Date;
}

// Define the context type
interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  sendMessage: (data: MessageData) => void;
  sendTyping: (data: TypingData) => void;
  sendMessageRead: (data: ReadReceiptData) => void;
}

// Create the context
const SocketContext = React.createContext<SocketContextType | undefined>(undefined);

// Provider component
export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = React.useState<Socket | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);
  const { user } = useAuth();

  React.useEffect(() => {
    // Use current origin if NEXT_PUBLIC_SOCKET_URL is not set
    const socketUrl = typeof window !== 'undefined'
      ? (process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin)
      : (process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000');

    console.log('Socket URL:', socketUrl);

    let newSocket: Socket | null = null;

    const handleConnect = () => {
      setIsConnected(true);
      console.log('Socket connected in provider');
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      console.log('Socket disconnected in provider');
    };

    const handleConnectError = (error: Error) => {
      console.error('Socket connection error in provider:', error);
      setIsConnected(false);
    };

    // Initialize socket client
    const initSocket = async () => {
      try {
        // Initialize the socket server first
        await fetch('/api/socket/io');

        // Connect client with correct path - server will initialize automatically
        console.log('Initializing socket client with URL:', socketUrl);
        newSocket = socketClient.init('dummy-token', {
          url: socketUrl,
          reconnection: true, // Enable reconnection for better reliability
          path: '/api/socket/io'
        });
        console.log('Socket client initialized');
        setSocket(newSocket);
        setIsConnected(newSocket.connected);

        newSocket.on('connect', handleConnect);
        newSocket.on('disconnect', handleDisconnect);
        newSocket.on('connect_error', handleConnectError);
      } catch (error) {
        console.error('Error initializing socket client:', error);
      }
    };

    initSocket();

    // Clean up on unmount
    return () => {
      socketClient.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, []);

  // Join user room when authenticated
  React.useEffect(() => {
    console.log('SocketProvider room join check:', {
      hasSocket: !!socket,
      isConnected,
      userId: user?.id,
      userRole: user?.role
    });

    if (socket && isConnected && user?.id) {
      console.log('✅ Joining user room:', `user-${user.id}`);
      socket.emit('user-join', user.id);
    } else {
      console.log('❌ Cannot join room:', {
        reason: !socket ? 'no socket' : !isConnected ? 'not connected' : !user?.id ? 'no user id' : 'unknown'
      });
    }
  }, [socket, isConnected, user]);

  // Join a conversation room
  const joinConversation = (conversationId: string) => {
    if (socket && isConnected) {
      socketClient.joinConversation(conversationId);
    }
  };

  // Leave a conversation room
  const leaveConversation = (conversationId: string) => {
    if (socket && isConnected) {
      socketClient.leaveConversation(conversationId);
    }
  };

  // Send a message
  const sendMessage = (data: MessageData) => {
    if (socket && isConnected) {
      socketClient.sendMessage(data);
    }
  };

  // Send typing indicator
  const sendTyping = (data: TypingData) => {
    if (socket && isConnected) {
      socketClient.sendTyping(data);
    }
  };

  // Send message read receipt
  const sendMessageRead = (data: ReadReceiptData) => {
    if (socket && isConnected) {
      socketClient.sendMessageRead(data);
    }
  };

  // Context value
  const value = {
    socket,
    isConnected,
    joinConversation,
    leaveConversation,
    sendMessage,
    sendTyping,
    sendMessageRead,
  };

  return React.createElement(SocketContext.Provider, { value }, children);
}

// Custom hook to use the socket context
export function useSocket() {
  const context = React.useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}