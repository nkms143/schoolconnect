import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import prisma from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getFriends = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized.', 401);
    }
    const userId = req.user.id;

    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }]
      },
      include: {
        userA: {
          select: {
            id: true,
            email: true,
            role: true,
            profile: true
          }
        },
        userB: {
          select: {
            id: true,
            email: true,
            role: true,
            profile: true
          }
        }
      }
    });

    const friends = friendships.map(f => {
      const friendUser = f.userAId === userId ? f.userB : f.userA;
      return {
        friendshipId: f.id,
        connectedAt: f.createdAt,
        user: friendUser
      };
    });

    return sendSuccess(res, 'Friends list retrieved.', friends);
  } catch (error: any) {
    return sendError(res, 'Failed to retrieve friends.', 500);
  }
};

export const getPendingRequests = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized.', 401);
    }
    const userId = req.user.id;

    const receivedRequests = await prisma.friendRequest.findMany({
      where: {
        receiverId: userId,
        status: 'PENDING' as any
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            profile: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const sentRequests = await prisma.friendRequest.findMany({
      where: {
        senderId: userId,
        status: 'PENDING' as any
      },
      include: {
        receiver: {
          select: {
            id: true,
            email: true,
            profile: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return sendSuccess(res, 'Pending requests retrieved.', {
      received: receivedRequests,
      sent: sentRequests
    });
  } catch (error: any) {
    return sendError(res, 'Failed to retrieve pending friend requests.', 500);
  }
};

export const sendFriendRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized.', 401);
    }
    const senderId = req.user.id;
    const { receiverId } = req.body;

    if (!receiverId || receiverId === senderId) {
      return sendError(res, 'Cannot send connection request to yourself or empty user.', 400);
    }

    // Check if already friends
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userAId: senderId, userBId: receiverId },
          { userAId: receiverId, userBId: senderId }
        ]
      }
    });

    if (existingFriendship) {
      return sendError(res, 'You are already connected with this student.', 400);
    }

    // Check if request already exists
    const existingReq = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId }
        ]
      }
    });

    if (existingReq) {
      if (existingReq.status === 'PENDING') {
        if (existingReq.senderId === senderId) {
          return sendError(res, 'Connection request is already pending.', 400);
        } else {
          // If the other person already sent a request, auto-accept!
          await prisma.$transaction([
            prisma.friendRequest.update({
              where: { id: existingReq.id },
              data: { status: 'ACCEPTED' as any }
            }),
            prisma.friendship.create({
              data: { userAId: existingReq.senderId, userBId: existingReq.receiverId }
            })
          ]);
          return sendSuccess(res, 'Connection accepted! You are now classmates connected.');
        }
      }
    }

    const request = await prisma.friendRequest.create({
      data: {
        senderId,
        receiverId,
        status: 'PENDING' as any
      }
    });

    return sendSuccess(res, 'Connection request sent successfully!', request, 201);
  } catch (error: any) {
    return sendError(res, 'Failed to send friend request.', 500);
  }
};

export const acceptFriendRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized.', 401);
    }
    const requestId = req.params.requestId as string;
    const userId = req.user.id;

    const request = await prisma.friendRequest.findUnique({
      where: { id: requestId }
    });

    if (!request || request.receiverId !== userId || request.status !== 'PENDING') {
      return sendError(res, 'Connection request not found or already handled.', 404);
    }

    await prisma.$transaction([
      prisma.friendRequest.update({
        where: { id: requestId },
        data: { status: 'ACCEPTED' as any }
      }),
      prisma.friendship.create({
        data: {
          userAId: request.senderId,
          userBId: request.receiverId
        }
      })
    ]);

    return sendSuccess(res, 'Connection request accepted!');
  } catch (error: any) {
    return sendError(res, 'Failed to accept friend request.', 500);
  }
};

export const rejectFriendRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized.', 401);
    }
    const requestId = req.params.requestId as string;
    const userId = req.user.id;

    const request = await prisma.friendRequest.findUnique({
      where: { id: requestId }
    });

    if (!request || request.receiverId !== userId) {
      return sendError(res, 'Connection request not found.', 404);
    }

    await prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED' as any }
    });

    return sendSuccess(res, 'Connection request rejected.');
  } catch (error: any) {
    return sendError(res, 'Failed to reject friend request.', 500);
  }
};

export const removeFriend = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized.', 401);
    }
    const friendshipId = req.params.friendshipId as string;
    const userId = req.user.id;

    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId }
    });

    if (!friendship || (friendship.userAId !== userId && friendship.userBId !== userId)) {
      return sendError(res, 'Connection not found.', 404);
    }

    await prisma.friendship.delete({
      where: { id: friendshipId }
    });

    return sendSuccess(res, 'Connection removed.');
  } catch (error: any) {
    return sendError(res, 'Failed to remove connection.', 500);
  }
};
