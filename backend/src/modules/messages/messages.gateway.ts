import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../../config/jwt.config';
import { TokenPayload } from '../../common/utils/jwt.util';

type ClientSocket = Socket & {
  data: {
    userId?: string;
  };
};

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  },
})
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(
    private messagesService: MessagesService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: ClientSocket) {
    try {
      const token = this.extractToken(client);

      if (!token) {
        client.disconnect();
        return;
      }

      const config = jwtConfig();
      const payload = await this.jwtService.verifyAsync<TokenPayload>(token, {
        secret: config.jwt.secret,
      });

      // Store user connection
      this.connectedUsers.set(payload.sub, client.id);
      client.data.userId = payload.sub;

      // Join user's own room
      client.join(`user:${payload.sub}`);

      console.log(`User ${payload.sub} connected: ${client.id}`);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'WebSocket auth error';
      console.error('WebSocket auth error:', message);
      client.disconnect();
    }
  }

  handleDisconnect(client: ClientSocket) {
    if (client.data.userId) {
      this.connectedUsers.delete(client.data.userId);
      console.log(`User ${client.data.userId} disconnected: ${client.id}`);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { receiverId: string; content: string },
    @ConnectedSocket() client: ClientSocket,
  ) {
    const senderId = client.data.userId;

    if (!senderId) {
      return { error: 'Unauthorized' };
    }

    try {
      const message = await this.messagesService.create(senderId, {
        receiverId: data.receiverId,
        content: data.content,
      });

      // Send to receiver if online
      this.server.to(`user:${data.receiverId}`).emit('newMessage', message);

      // Send confirmation to sender
      return { success: true, message };
    } catch (error: unknown) {
      return {
        error:
          error instanceof Error ? error.message : 'Failed to send message',
      };
    }
  }

  @SubscribeMessage('joinConversation')
  handleJoinConversation(
    @MessageBody() data: { partnerId: string },
    @ConnectedSocket() client: ClientSocket,
  ) {
    const userId = client.data.userId;
    if (!userId) {
      return { error: 'Unauthorized' };
    }
    const roomId = this.getConversationRoomId(userId, data.partnerId);

    client.join(roomId);
    console.log(`User ${userId} joined conversation room: ${roomId}`);

    return { success: true, roomId };
  }

  @SubscribeMessage('leaveConversation')
  handleLeaveConversation(
    @MessageBody() data: { partnerId: string },
    @ConnectedSocket() client: ClientSocket,
  ) {
    const userId = client.data.userId;
    if (!userId) {
      return { error: 'Unauthorized' };
    }
    const roomId = this.getConversationRoomId(userId, data.partnerId);

    client.leave(roomId);
    console.log(`User ${userId} left conversation room: ${roomId}`);

    return { success: true };
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { receiverId: string; isTyping: boolean },
    @ConnectedSocket() client: ClientSocket,
  ) {
    const senderId = client.data.userId;
    if (!senderId) {
      return { error: 'Unauthorized' };
    }

    // Send typing indicator to receiver
    this.server.to(`user:${data.receiverId}`).emit('userTyping', {
      userId: senderId,
      isTyping: data.isTyping,
    });

    return { success: true };
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @MessageBody() data: { messageId: string },
    @ConnectedSocket() client: ClientSocket,
  ) {
    const userId = client.data.userId;
    if (!userId) {
      return { error: 'Unauthorized' };
    }

    try {
      await this.messagesService.markAsRead(data.messageId, userId);

      // Notify sender that message was read
      const message = await this.messagesService.findMessageById(
        data.messageId,
      );
      if (message) {
        this.server.to(`user:${message.senderId}`).emit('messageRead', {
          messageId: data.messageId,
          readBy: userId,
        });
      }

      return { success: true };
    } catch (error: unknown) {
      return {
        error:
          error instanceof Error ? error.message : 'Failed to mark as read',
      };
    }
  }

  private getConversationRoomId(userId1: string, userId2: string): string {
    // Create consistent room ID regardless of order
    return [userId1, userId2].sort().join('-');
  }

  // Helper to send notification to specific user
  sendToUser<T>(userId: string, event: string, data: T) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  private extractToken(client: Socket): string | undefined {
    const authToken = client.handshake.auth?.token;
    if (typeof authToken === 'string' && authToken.length > 0) {
      return authToken;
    }

    const header = client.handshake.headers.authorization;
    if (typeof header === 'string' && header.startsWith('Bearer ')) {
      return header.split(' ')[1];
    }

    return undefined;
  }
}
