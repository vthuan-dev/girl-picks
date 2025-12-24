import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async create(senderId: string, createMessageDto: CreateMessageDto) {
    const { receiverId, content } = createMessageDto;

    // Check if receiver exists
    const receiver = await this.prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      throw new NotFoundException('Receiver not found');
    }

    if (!receiver.isActive) {
      throw new BadRequestException('Receiver is not active');
    }

    // Check if sender is blocked by receiver
    const isBlocked = await this.prisma.block.findFirst({
      where: {
        blockerId: receiverId,
        blockedId: senderId,
      },
    });

    if (isBlocked) {
      throw new ForbiddenException('You are blocked by this user');
    }

    return this.prisma.message.create({
      data: {
        senderId,
        receiverId,
        content,
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
        receiver: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async findConversations(userId: string) {
    // Get all unique users that current user has conversed with
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            role: true,
          },
        },
        receiver: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Group by conversation partner
    type ConversationSummary = {
      user: {
        id: string;
        fullName: string;
        avatarUrl: string | null;
        role: string;
      };
      lastMessage: (typeof messages)[number];
      unreadCount: number;
    };

    const conversationsMap = new Map<string, ConversationSummary>();

    messages.forEach((message) => {
      const partnerId =
        message.senderId === userId ? message.receiverId : message.senderId;
      const partner =
        message.senderId === userId ? message.receiver : message.sender;

      const existing = conversationsMap.get(partnerId);

      if (!existing) {
        conversationsMap.set(partnerId, {
          user: partner,
          lastMessage: message,
          unreadCount: 0,
        });
      } else if (message.createdAt > existing.lastMessage.createdAt) {
        existing.lastMessage = message;
      }

      if (message.receiverId === userId && !message.isRead) {
        const conversation = conversationsMap.get(partnerId);
        if (conversation) {
          conversation.unreadCount += 1;
        }
      }
    });

    return Array.from(conversationsMap.values());
  }

  async findConversation(
    userId: string,
    partnerId: string,
    page = 1,
    limit = 50,
  ) {
    const where = {
      OR: [
        { senderId: userId, receiverId: partnerId },
        { senderId: partnerId, receiverId: userId },
      ],
    };

    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where,
        include: {
          sender: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
          receiver: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.message.count({ where }),
    ]);

    return {
      data: messages.reverse(), // Reverse to show oldest first
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async markAsRead(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Only receiver can mark as read
    if (message.receiverId !== userId) {
      throw new ForbiddenException(
        'You can only mark received messages as read',
      );
    }

    return this.prisma.message.update({
      where: { id: messageId },
      data: { isRead: true },
    });
  }

  async markConversationAsRead(userId: string, partnerId: string) {
    return this.prisma.message.updateMany({
      where: {
        senderId: partnerId,
        receiverId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.message.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });
  }

  async deleteMessage(id: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Only sender can delete
    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    return this.prisma.message.delete({
      where: { id },
    });
  }

  async findMessageById(id: string) {
    return this.prisma.message.findUnique({
      where: { id },
      select: {
        id: true,
        senderId: true,
        receiverId: true,
      },
    });
  }
}
