import { Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import UserModel from '../../../models/user/User';
import dbConnect from '../db/connect';

// Extend Socket type to include user information
declare module 'socket.io' {
  interface Socket {
    userId?: string;
    user?: unknown;
  }
}

interface JwtPayload {
  id: string;
}

interface UserDocument {
  _id: unknown;
}

// Socket authentication middleware
export const socketAuthMiddleware = async (socket: Socket, next: (err?: Error) => void) => {
  try {
    // Extract token from handshake
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || '') as JwtPayload;
    
    if (!decoded || !decoded.id) {
      return next(new Error('Authentication error: Invalid token'));
    }

    // Connect to database
    await dbConnect();

    // Find user in database
    const user = await UserModel.findById(decoded.id);
    
    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    // Attach user information to socket
    socket.userId = (user as unknown as UserDocument)._id as string;
    socket.user = user as unknown;

    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication error'));
  }
};

// Socket connection manager
export class SocketConnectionManager {
  private userSockets: Map<string, string> = new Map();
  private userRooms: Map<string, Set<string>> = new Map();

  // Register user connection
  public registerUser(socket: Socket): void {
    if (socket.userId) {
      this.userSockets.set(socket.userId, socket.id);
      console.log(`User ${socket.userId} registered with socket ${socket.id}`);
    }
  }

  // Unregister user connection
  public unregisterUser(socket: Socket): void {
    if (socket.userId) {
      this.userSockets.delete(socket.userId);
      
      // Remove user from all rooms
      this.userRooms.delete(socket.userId);
      
      console.log(`User ${socket.userId} unregistered`);
    }
  }

  // Get socket ID for a user
  public getUserSocketId(userId: string): string | undefined {
    return this.userSockets.get(userId);
  }

  // Add user to a room
  public addUserToRoom(userId: string, roomId: string): void {
    if (!this.userRooms.has(userId)) {
      this.userRooms.set(userId, new Set());
    }
    this.userRooms.get(userId)?.add(roomId);
  }

  // Remove user from a room
  public removeUserFromRoom(userId: string, roomId: string): void {
    const rooms = this.userRooms.get(userId);
    if (rooms) {
      rooms.delete(roomId);
    }
  }

  // Get all rooms for a user
  public getUserRooms(userId: string): Set<string> | undefined {
    return this.userRooms.get(userId);
  }
}

// Create singleton instance
export const connectionManager = new SocketConnectionManager();