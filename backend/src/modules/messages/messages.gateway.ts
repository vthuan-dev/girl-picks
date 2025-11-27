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
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../../config/jwt.config';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  },
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(
    private messagesService: MessagesService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // Get token from handshake
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      // Verify token
      const config = jwtConfig();
      const payload = await this.jwtService.verifyAsync(token, {
        secret: config.jwt.secret,
      });

      // Store user connection
      this.connectedUsers.set(payload.sub, client.id);
      client.data.userId = payload.sub;

      // Join user's own room
      client.join(`user:${payload.sub}`);

      console.log(`User ${payload.sub} connected: ${client.id}`);
    } catch (error) {
      console.error('WebSocket auth error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    if (client.data.userId) {
      this.connectedUsers.delete(client.data.userId);
      console.log(`User ${client.data.userId} disconnected: ${client.id}`);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { receiverId: string; content: string },
    @ConnectedSocket() client: Socket,
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
    } catch (error) {
      return { error: error.message };
    }
  }

  @SubscribeMessage('joinConversation')
  handleJoinConversation(
    @MessageBody() data: { partnerId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;
    const roomId = this.getConversationRoomId(userId, data.partnerId);

    client.join(roomId);
    console.log(`User ${userId} joined conversation room: ${roomId}`);

    return { success: true, roomId };
  }

  @SubscribeMessage('leaveConversation')
  handleLeaveConversation(
    @MessageBody() data: { partnerId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;
    const roomId = this.getConversationRoomId(userId, data.partnerId);

    client.leave(roomId);
    console.log(`User ${userId} left conversation room: ${roomId}`);

    return { success: true };
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { receiverId: string; isTyping: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    const senderId = client.data.userId;

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
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;

    try {
      await this.messagesService.markAsRead(data.messageId, userId);

      // Notify sender that message was read
      const message = await this.messagesService['findOne'](data.messageId);
      if (message) {
        this.server.to(`user:${message.senderId}`).emit('messageRead', {
          messageId: data.messageId,
          readBy: userId,
        });
      }

      return { success: true };
    } catch (error) {
      return { error: error.message };
    }
  }

  private getConversationRoomId(userId1: string, userId2: string): string {
    // Create consistent room ID regardless of order
    return [userId1, userId2].sort().join('-');
  }

  // Helper to send notification to specific user
  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }
}

