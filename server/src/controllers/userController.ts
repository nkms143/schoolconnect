import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import prisma from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const currentUserId = req.user?.id;

    const user: any = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        clubMemberships: {
          include: {
            club: true
          }
        },
        _count: {
          select: {
            posts: true,
            friendshipsInitiated: true,
            friendshipsReceived: true
          }
        }
      }
    });

    if (!user) {
      return sendError(res, 'Student profile not found.', 404);
    }

    // Check relationship with current user
    let connectionStatus: 'NONE' | 'FRIENDS' | 'REQUEST_SENT' | 'REQUEST_RECEIVED' | 'SELF' = 'NONE';

    if (currentUserId === userId) {
      connectionStatus = 'SELF';
    } else if (currentUserId) {
      const friendship = await prisma.friendship.findFirst({
        where: {
          OR: [
            { userAId: currentUserId, userBId: userId },
            { userAId: userId, userBId: currentUserId }
          ]
        }
      });

      if (friendship) {
        connectionStatus = 'FRIENDS';
      } else {
        const sentReq = await prisma.friendRequest.findFirst({
          where: { senderId: currentUserId, receiverId: userId, status: 'PENDING' }
        });
        if (sentReq) {
          connectionStatus = 'REQUEST_SENT';
        } else {
          const recReq = await prisma.friendRequest.findFirst({
            where: { senderId: userId, receiverId: currentUserId, status: 'PENDING' }
          });
          if (recReq) {
            connectionStatus = 'REQUEST_RECEIVED';
          }
        }
      }
    }

    const totalFriends = (user._count?.friendshipsInitiated || 0) + (user._count?.friendshipsReceived || 0);

    return sendSuccess(res, 'Profile retrieved.', {
      id: user.id,
      email: user.email,
      role: user.role,
      profile: user.profile,
      stats: {
        postsCount: user._count?.posts || 0,
        friendsCount: totalFriends,
        clubsCount: user.clubMemberships?.length || 0
      },
      clubs: (user.clubMemberships || []).map((cm: any) => ({
        id: cm.club.id,
        name: cm.club.name,
        slug: cm.club.slug,
        category: cm.club.category,
        role: cm.role
      })),
      connectionStatus
    });
  } catch (error: any) {
    return sendError(res, 'Failed to fetch profile.', 500);
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized.', 401);
    }

    const { fullName, avatarUrl, grade, section, bio, interests, phone, coverImage } = req.body;

    const updatedProfile = await prisma.profile.upsert({
      where: { userId: req.user.id },
      update: {
        ...(fullName && { fullName }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(grade !== undefined && { grade }),
        ...(section !== undefined && { section }),
        ...(bio !== undefined && { bio }),
        ...(interests !== undefined && { interests }),
        ...(phone !== undefined && { phone }),
        ...(coverImage !== undefined && { coverImage })
      },
      create: {
        userId: req.user.id,
        fullName: fullName || 'SchoolConnect Student',
        avatarUrl,
        grade,
        section,
        bio,
        interests,
        phone,
        coverImage
      }
    });

    return sendSuccess(res, 'Profile updated successfully!', updatedProfile);
  } catch (error: any) {
    return sendError(res, 'Failed to update profile.', 500);
  }
};

export const searchUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const query = (req.query.q as string) || '';
    const currentUserId = req.user?.id;

    const users = await prisma.user.findMany({
      where: {
        AND: [
          currentUserId ? { id: { not: currentUserId } } : {},
          { isBlocked: false },
          {
            OR: [
              { email: { contains: query } },
              {
                profile: {
                  fullName: { contains: query }
                }
              },
              {
                profile: {
                  interests: { contains: query }
                }
              }
            ]
          }
        ]
      },
      include: {
        profile: true
      },
      take: 20
    });

    return sendSuccess(
      res,
      'Users retrieved.',
      users.map(u => ({
        id: u.id,
        email: u.email,
        role: u.role,
        profile: u.profile
      }))
    );
  } catch (error: any) {
    return sendError(res, 'Failed to search users.', 500);
  }
};

export const getSuggestedFriends = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized.', 401);
    }
    const currentUserId = req.user.id;

    // Get all existing friends
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ userAId: currentUserId }, { userBId: currentUserId }]
      }
    });

    const friendIds = friendships.map(f =>
      f.userAId === currentUserId ? f.userBId : f.userAId
    );

    // Get users with pending requests
    const sentRequests = await prisma.friendRequest.findMany({
      where: { senderId: currentUserId, status: 'PENDING' }
    });
    const pendingTargetIds = sentRequests.map(r => r.receiverId);

    const excludedIds = [currentUserId, ...friendIds, ...pendingTargetIds];

    const suggested = await prisma.user.findMany({
      where: {
        id: { notIn: excludedIds },
        role: 'STUDENT',
        isBlocked: false
      },
      include: {
        profile: true,
        clubMemberships: {
          include: { club: true }
        }
      },
      take: 8
    });

    return sendSuccess(
      res,
      'Suggested friends retrieved.',
      suggested.map((s: any) => ({
        id: s.id,
        email: s.email,
        profile: s.profile,
        clubs: (s.clubMemberships || []).map((cm: any) => cm.club.name)
      }))
    );
  } catch (error: any) {
    return sendError(res, 'Failed to get suggested friends.', 500);
  }
};
