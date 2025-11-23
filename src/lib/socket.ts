import { Server as IOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

let io: IOServer | null = null;

export function initIO(httpServer: HTTPServer) {
    if (!io) {
        io = new IOServer(httpServer, {
            path: '/api/socketio',
            addTrailingSlash: false,
        });
    }
    return io;
}

export function getIO(): IOServer | null {
    return io;
}
