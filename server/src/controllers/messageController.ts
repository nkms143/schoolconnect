import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import prisma from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getConversations = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized.', 401);
    }
    const userId = req.user.id;

    // Fetch all messages involving the user
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }]
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            role: true,
            profile: { select: { fullName: true, avatarUrl: true, grade: true, section: true } }
          }
        },
        receiver: {
          select: {
            id: true,
            email: true,
            role: true,
            profile: { select: { fullName: true, avatarUrl: true, grade: true, section: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Group by other user id
    const conversationMap = new Map<string, any>();

    for (const msg of messages) {
      const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
      if (!conversationMap.has(otherUser.id)) {
        conversationMap.set(otherUser.id, {
          user: otherUser,
          lastMessage: {
            id: msg.id,
            content: msg.content,
            createdAt: msg.createdAt,
            senderId: msg.senderId,
            isRead: msg.isRead
          },
          unreadCount: 0
        });
      }

      if (msg.receiverId === userId && !msg.isRead) {
        const conv = conversationMap.get(otherUser.id);
        conv.unreadCount += 1;
      }
    }

    return sendSuccess(res, 'Conversations retrieved.', Array.from(conversationMap.values()));
  } catch (error: any) {
    return sendError(res, 'Failed to retrieve conversations.', 500);
  }
};

export const getMessagesWithUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized.', 401);
    }
    const currentUserId = req.user.id;
    const targetUserId = req.params.targetUserId as string;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: targetUserId },
          { senderId: targetUserId, receiverId: currentUserId }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            profile: { select: { fullName: true, avatarUrl: true } }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Mark as read
    await prisma.message.updateMany({
      where: {
        senderId: targetUserId,
        receiverId: currentUserId,
        isRead: false
      },
      data: { isRead: true }
    });

    return sendSuccess(res, 'Chat history retrieved.', messages);
  } catch (error: any) {
    return sendError(res, 'Failed to retrieve chat messages.', 500);
  }
};

export const sendMessage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized.', 401);
    }
    const senderId = req.user.id;
    const { receiverId, content } = req.body;

    if (!receiverId || !content || !content.trim()) {
      return sendError(res, 'Receiver ID and message content are required.', 400);
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content: content.trim()
      },
      include: {
        sender: {
          select: {
            id: true,
            profile: { select: { fullName: true, avatarUrl: true } }
          }
        }
      }
    });

    return sendSuccess(res, 'Message sent.', message, 201);
  } catch (error: any) {
    return sendError(res, 'Failed to send message.', 500);
  }
};
