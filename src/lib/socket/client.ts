import { io, Socket } from 'socket.io-client';

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

class SocketClient {
  private socket: Socket | null = null;
  private token: string | null = null;

  // Initialize socket connection
  public init(token: string, opts?: { url?: string; reconnection?: boolean; path?: string }): Socket {
    this.token = token;

    const url = opts?.url || process.env.NEXT_PUBLIC_SOCKET_URL || '';
    // if (!url) {
    //   console.warn('Socket disabled: NEXT_PUBLIC_SOCKET_URL not set');
    //   // Leave socket as null and return a dummy-like object cast for callers that check connected
    //   this.socket = io('', { autoConnect: false });
    //   return this.socket;
    // }

    // Initialize socket with authentication
    this.socket = io(url, {
      auth: { token: this.token },
      reconnection: opts?.reconnection ?? false,
      path: opts?.path ?? '/api/socket/io',
    });

    // Set up event listeners
    this.setupEventListeners();

    return this.socket;
  }

  // Get socket instance
  public getSocket(): Socket | null {
    return this.socket;
  }

  // Check if socket is connected
  public isConnected(): boolean {
    return this.socket ? this.socket.connected : false;
  }

  // Disconnect socket
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Join a conversation room
  public joinConversation(conversationId: string): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('join-chat', conversationId);
    }
  }

  // Leave a conversation room
  public leaveConversation(conversationId: string): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('leave-chat', conversationId);
    }
  }

  // Send a message
  public sendMessage(data: MessageData): void {
    console.log('🔵 SocketClient.sendMessage called');
    console.log('Socket exists?', !!this.socket);
    console.log('Socket connected?', this.socket?.connected);
    console.log('Message data:', data);

    if (this.socket && this.socket.connected) {
      console.log('✅ Emitting send-message to server');
      this.socket.emit('send-message', data);
      console.log('✅ Emit completed');
    } else {
      console.error('❌ Cannot send message - socket not connected');
    }
  }

  // Send typing indicator
  public sendTyping(data: TypingData): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit(data.isTyping ? 'typing-start' : 'typing-stop', data);
    }
  }

  // Send message read receipt
  public sendMessageRead(data: ReadReceiptData): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('mark-read', data);
    }
  }

  // Update user status
  public updateUserStatus(online: boolean): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('user-status-update', { online });
    }
  }

  // Set up event listeners
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error);
    });
  }

  // Listen for events
  public on(event: string, callback: (...args: unknown[]) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Remove event listener
  public off(event: string, callback?: (...args: unknown[]) => void): void {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }
}

// Create singleton instance
const socketClient = new SocketClient();

export default socketClient;