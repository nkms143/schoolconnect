import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import prisma from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getPlatformStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalTeachers,
      totalPosts,
      totalClubs,
      totalPolls,
      totalAnnouncements,
      pendingReports
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'STUDENT' as any } }),
      prisma.user.count({ where: { role: 'TEACHER' as any } }),
      prisma.post.count(),
      prisma.club.count(),
      prisma.poll.count(),
      prisma.announcement.count(),
      prisma.report.count({ where: { status: 'PENDING' as any } })
    ]);

    return sendSuccess(res, 'Platform statistics retrieved.', {
      totalUsers,
      totalStudents,
      totalTeachers,
      totalPosts,
      totalClubs,
      totalPolls,
      totalAnnouncements,
      pendingReports
    });
  } catch (error: any) {
    return sendError(res, 'Failed to retrieve stats.', 500);
  }
};

export const getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { role, search } = req.query;

    const where: any = {};
    if (role && role !== 'ALL') {
      where.role = role as string;
    }
    if (search) {
      where.OR = [
        { email: { contains: search as string } },
        { profile: { fullName: { contains: search as string } } }
      ];
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        profile: true,
        _count: {
          select: {
            posts: true,
            comments: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return sendSuccess(res, 'Users retrieved.', users);
  } catch (error: any) {
    return sendError(res, 'Failed to retrieve users.', 500);
  }
};

export const toggleUserBlock = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.params.userId as string;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return sendError(res, 'User not found.', 404);
    }

    if (user.role === 'ADMIN') {
      return sendError(res, 'Cannot block an administrator account.', 400);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isBlocked: !user.isBlocked },
      include: { profile: true }
    });

    return sendSuccess(
      res,
      updatedUser.isBlocked ? 'User has been blocked.' : 'User has been unblocked.',
      updatedUser
    );
  } catch (error: any) {
    return sendError(res, 'Failed to update user block status.', 500);
  }
};

export const createNewClub = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, category, description, bannerUrl, iconUrl } = req.body;

    if (!name || !description || !category) {
      return sendError(res, 'Name, category, and description are required.', 400);
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const club = await prisma.club.create({
      data: {
        name,
        slug,
        category,
        description,
        bannerUrl: bannerUrl || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
        iconUrl: iconUrl || '🏫'
      }
    });

    return sendSuccess(res, 'School club established successfully!', club, 201);
  } catch (error: any) {
    return sendError(res, 'Failed to create club.', 500);
  }
};

export const getReports = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const reports = await prisma.report.findMany({
      include: {
        reporter: {
          select: {
            id: true,
            email: true,
            profile: { select: { fullName: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return sendSuccess(res, 'Moderation reports retrieved.', reports);
  } catch (error: any) {
    return sendError(res, 'Failed to retrieve reports.', 500);
  }
};

export const createReport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized.', 401);
    }
    const { targetType, targetId, reason } = req.body;

    if (!targetType || !targetId || !reason) {
      return sendError(res, 'Target type, target ID, and reason are required.', 400);
    }

    const report = await prisma.report.create({
      data: {
        reporterId: req.user.id,
        targetType,
        targetId,
        reason
      }
    });

    return sendSuccess(res, 'Content reported to school moderators. Thank you for keeping our school safe!', report, 201);
  } catch (error: any) {
    return sendError(res, 'Failed to submit report.', 500);
  }
};
