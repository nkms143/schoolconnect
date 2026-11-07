import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import prisma from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getAnnouncements = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category, priority } = req.query;

    const where: any = {};
    if (category && category !== 'ALL') {
      where.category = category as any;
    }
    if (priority && priority !== 'ALL') {
      where.priority = priority as any;
    }

    const announcements = await prisma.announcement.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            role: true,
            profile: {
              select: {
                fullName: true,
                avatarUrl: true,
                section: true
              }
            }
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return sendSuccess(res, 'Announcements retrieved.', announcements);
  } catch (error: any) {
    return sendError(res, 'Failed to retrieve announcements.', 500);
  }
};

export const createAnnouncement = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized.', 401);
    }

    if (req.user.role !== 'TEACHER' && req.user.role !== 'ADMIN') {
      return sendError(res, 'Only teachers and administrators can post school notices.', 403);
    }

    const { title, content, category = 'CIRCULAR', priority = 'NORMAL', targetGrade = 'ALL', attachmentUrl } = req.body;

    if (!title || !content) {
      return sendError(res, 'Title and notice content are required.', 400);
    }

    const announcement = await prisma.announcement.create({
      data: {
        authorId: req.user.id,
        title,
        content,
        category: category as any,
        priority: priority as any,
        targetGrade,
        attachmentUrl: attachmentUrl || null
      },
      include: {
        author: {
          select: {
            id: true,
            role: true,
            profile: {
              select: {
                fullName: true,
                avatarUrl: true,
                section: true
              }
            }
          }
        }
      }
    });

    return sendSuccess(res, 'School notice published successfully!', announcement, 201);
  } catch (error: any) {
    return sendError(res, 'Failed to publish announcement.', 500);
  }
};

export const deleteAnnouncement = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized.', 401);
    }

    if (req.user.role !== 'TEACHER' && req.user.role !== 'ADMIN') {
      return sendError(res, 'Only teachers and administrators can delete school notices.', 403);
    }

    const id = req.params.id as string;

    const notice = await prisma.announcement.findUnique({ where: { id } });
    if (!notice) {
      return sendError(res, 'Notice not found.', 404);
    }

    await prisma.announcement.delete({ where: { id } });

    return sendSuccess(res, 'Notice deleted successfully.');
  } catch (error: any) {
    return sendError(res, 'Failed to delete notice.', 500);
  }
};
