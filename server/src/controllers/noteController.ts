import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import prisma from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getNotes = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { subject, grade, search, sortBy } = req.query as {
      subject?: string;
      grade?: string;
      search?: string;
      sortBy?: 'helpful' | 'recent';
    };

    const where: any = {};
    if (subject && subject !== 'ALL') where.subject = subject;
    if (grade && grade !== 'ALL') where.grade = grade;
    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { chapter: { contains: search, mode: 'insensitive' } }
      ];
    }

    const orderBy: any = sortBy === 'recent'
      ? { createdAt: 'desc' }
      : [{ helpfulCount: 'desc' }, { createdAt: 'desc' }];

    const notes = await prisma.studyNote.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true,
            profile: {
              select: {
                fullName: true,
                avatarUrl: true,
                grade: true,
                section: true
              }
            }
          }
        },
        helpfulVotes: {
          select: { id: true, userId: true }
        }
      },
      orderBy
    });

    const currentUserId = req.user?.id;

    const formatted = notes.map((n) => ({
      id: n.id,
      title: n.title,
      description: n.description,
      subject: n.subject,
      grade: n.grade,
      chapter: n.chapter,
      fileUrl: n.fileUrl,
      fileType: n.fileType,
      helpfulCount: n.helpfulCount,
      hasVoted: Boolean(currentUserId && n.helpfulVotes.some((v) => v.userId === currentUserId)),
      createdAt: n.createdAt,
      author: n.author
    }));

    return sendSuccess(res, 'Study notes retrieved successfully.', formatted);
  } catch (error: any) {
    return sendError(res, 'Failed to fetch study notes.', 500);
  }
};

export const createNote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, subject, grade, chapter, fileUrl, fileType } = req.body;

    if (!title || !description || !subject || !grade || !fileUrl) {
      return sendError(res, 'Title, description, subject, grade, and file URL are required.', 400);
    }

    const note = await prisma.studyNote.create({
      data: {
        authorId: req.user!.id,
        title,
        description,
        subject,
        grade,
        chapter: chapter || null,
        fileUrl,
        fileType: (fileType || 'PDF').toUpperCase()
      },
      include: {
        author: {
          include: { profile: true }
        }
      }
    });

    return sendSuccess(res, 'Study note shared successfully!', note, 201);
  } catch (error: any) {
    return sendError(res, 'Failed to create study note.', 500);
  }
};

export const toggleHelpfulVote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.id;

    const note = await prisma.studyNote.findUnique({ where: { id } });
    if (!note) return sendError(res, 'Study note not found.', 404);

    const existingVote = await prisma.noteHelpfulVote.findUnique({
      where: {
        noteId_userId: {
          noteId: id,
          userId
        }
      }
    });

    let hasVoted = false;
    let newCount = note.helpfulCount;

    if (existingVote) {
      await prisma.noteHelpfulVote.delete({ where: { id: existingVote.id } });
      newCount = Math.max(0, note.helpfulCount - 1);
      await prisma.studyNote.update({
        where: { id },
        data: { helpfulCount: newCount }
      });
      hasVoted = false;
    } else {
      await prisma.noteHelpfulVote.create({
        data: { noteId: id, userId }
      });
      newCount = note.helpfulCount + 1;
      await prisma.studyNote.update({
        where: { id },
        data: { helpfulCount: newCount }
      });
      hasVoted = true;
    }

    return sendSuccess(res, hasVoted ? 'Marked note as helpful!' : 'Removed helpful vote.', {
      noteId: id,
      helpfulCount: newCount,
      hasVoted
    });
  } catch (error: any) {
    return sendError(res, 'Failed to update vote.', 500);
  }
};

export const deleteNote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const note = await prisma.studyNote.findUnique({ where: { id } });
    if (!note) return sendError(res, 'Study note not found.', 404);

    if (note.authorId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return sendError(res, 'Unauthorized to delete this note.', 403);
    }

    await prisma.studyNote.delete({ where: { id } });
    return sendSuccess(res, 'Study note deleted successfully.');
  } catch (error: any) {
    return sendError(res, 'Failed to delete note.', 500);
  }
};
