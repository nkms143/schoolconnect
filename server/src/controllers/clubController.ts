import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import prisma from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getClubs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const currentUserId = req.user?.id;

    const clubs = await prisma.club.findMany({
      include: {
        leader: {
          select: {
            id: true,
            profile: {
              select: { fullName: true, avatarUrl: true }
            }
          }
        },
        _count: {
          select: {
            members: true,
            posts: true,
            events: true,
            discussions: true
          }
        },
        members: currentUserId
          ? {
              where: { userId: currentUserId },
              select: { role: true }
            }
          : false
      },
      orderBy: { name: 'asc' }
    });

    const formatted = clubs.map((club: any) => ({
      id: club.id,
      name: club.name,
      slug: club.slug,
      category: club.category,
      description: club.description,
      bannerUrl: club.bannerUrl,
      iconUrl: club.iconUrl,
      leader: club.leader,
      membersCount: club._count?.members || 0,
      postsCount: club._count?.posts || 0,
      eventsCount: club._count?.events || 0,
      discussionsCount: club._count?.discussions || 0,
      isMember: club.members && club.members.length > 0,
      userRole: club.members && club.members.length > 0 ? club.members[0].role : null
    }));

    return sendSuccess(res, 'Clubs retrieved.', formatted);
  } catch (error: any) {
    return sendError(res, 'Failed to retrieve clubs.', 500);
  }
};

export const getClubBySlug = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const slug = req.params.slug as string;
    const currentUserId = req.user?.id;

    const club = await prisma.club.findUnique({
      where: { slug },
      include: {
        leader: {
          select: {
            id: true,
            email: true,
            profile: {
              select: { fullName: true, avatarUrl: true, grade: true, section: true }
            }
          }
        },
        events: {
          orderBy: { eventDate: 'asc' }
        },
        discussions: {
          include: {
            author: {
              select: {
                id: true,
                profile: { select: { fullName: true, avatarUrl: true } }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                profile: { select: { fullName: true, avatarUrl: true, grade: true, section: true } }
              }
            }
          },
          take: 20
        },
        _count: {
          select: {
            members: true,
            posts: true,
            events: true,
            discussions: true
          }
        }
      }
    });

    if (!club) {
      return sendError(res, 'Club not found.', 404);
    }

    const membership = currentUserId
      ? await prisma.clubMember.findUnique({
          where: { clubId_userId: { clubId: club.id, userId: currentUserId } }
        })
      : null;

    return sendSuccess(res, 'Club details retrieved.', {
      ...club,
      isMember: !!membership,
      userRole: membership ? membership.role : null
    });
  } catch (error: any) {
    return sendError(res, 'Failed to retrieve club.', 500);
  }
};

export const joinClub = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized.', 401);
    }
    const clubId = req.params.clubId as string;
    const userId = req.user.id;

    const club = await prisma.club.findUnique({ where: { id: clubId } });
    if (!club) {
      return sendError(res, 'Club not found.', 404);
    }

    const existing = await prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId, userId } }
    });

    if (existing) {
      return sendError(res, 'You are already a member of this club.', 400);
    }

    const membership = await prisma.clubMember.create({
      data: {
        clubId,
        userId,
        role: 'MEMBER' as any
      }
    });

    const membersCount = await prisma.clubMember.count({ where: { clubId } });

    return sendSuccess(res, `Joined ${club.name} successfully!`, {
      isMember: true,
      role: membership.role,
      membersCount
    });
  } catch (error: any) {
    return sendError(res, 'Failed to join club.', 500);
  }
};

export const leaveClub = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized.', 401);
    }
    const clubId = req.params.clubId as string;
    const userId = req.user.id;

    const existing = await prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId, userId } }
    });

    if (!existing) {
      return sendError(res, 'You are not a member of this club.', 400);
    }

    await prisma.clubMember.delete({
      where: { id: existing.id }
    });

    const membersCount = await prisma.clubMember.count({ where: { clubId } });

    return sendSuccess(res, 'You have left the club.', {
      isMember: false,
      membersCount
    });
  } catch (error: any) {
    return sendError(res, 'Failed to leave club.', 500);
  }
};

export const createClubDiscussion = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized.', 401);
    }
    const clubId = req.params.clubId as string;
    const { title, content } = req.body;

    if (!title || !content) {
      return sendError(res, 'Title and content are required.', 400);
    }

    const discussion = await prisma.clubDiscussion.create({
      data: {
        clubId,
        authorId: req.user.id,
        title,
        content
      },
      include: {
        author: {
          select: {
            id: true,
            profile: { select: { fullName: true, avatarUrl: true } }
          }
        }
      }
    });

    return sendSuccess(res, 'Discussion created.', discussion, 201);
  } catch (error: any) {
    return sendError(res, 'Failed to create discussion.', 500);
  }
};

export const createClubEvent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized.', 401);
    }
    const clubId = req.params.clubId as string;
    const { title, description, eventDate, location } = req.body;

    if (!title || !eventDate || !location) {
      return sendError(res, 'Title, event date, and location are required.', 400);
    }

    const event = await prisma.clubEvent.create({
      data: {
        clubId,
        title,
        description: description || '',
        eventDate: new Date(eventDate),
        location
      }
    });

    return sendSuccess(res, 'Club event scheduled.', event, 201);
  } catch (error: any) {
    return sendError(res, 'Failed to create club event.', 500);
  }
};
