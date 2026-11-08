import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import prisma from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getAssignments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { grade, subject } = req.query as { grade?: string; subject?: string };

    const where: any = {};
    if (grade && grade !== 'ALL') where.grade = grade;
    if (subject && subject !== 'ALL') where.subject = subject;

    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            role: true,
            profile: {
              select: { fullName: true, avatarUrl: true }
            }
          }
        },
        submissions: {
          select: {
            id: true,
            studentId: true,
            status: true,
            grade: true,
            submittedAt: true
          }
        }
      },
      orderBy: { dueDate: 'asc' }
    });

    const now = new Date();

    const formatted = assignments.map((a) => {
      const userSub = req.user
        ? a.submissions.find((s) => s.studentId === req.user?.id)
        : null;

      const isOverdue = now > a.dueDate && !userSub;

      return {
        id: a.id,
        title: a.title,
        description: a.description,
        subject: a.subject,
        grade: a.grade,
        dueDate: a.dueDate,
        maxPoints: a.maxPoints,
        attachmentUrl: a.attachmentUrl,
        createdAt: a.createdAt,
        creator: a.creator,
        totalSubmissions: a.submissions.length,
        hasSubmitted: Boolean(userSub),
        submissionStatus: userSub ? userSub.status : isOverdue ? 'LATE' : 'PENDING',
        userGrade: userSub?.grade ?? null,
        isOverdue
      };
    });

    return sendSuccess(res, 'Assignments fetched successfully.', formatted);
  } catch (error: any) {
    return sendError(res, 'Failed to fetch assignments.', 500);
  }
};

export const getAssignmentById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const isTeacherOrAdmin = req.user?.role === 'TEACHER' || req.user?.role === 'ADMIN';

    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        creator: {
          include: { profile: true }
        },
        submissions: {
          include: {
            student: {
              select: {
                id: true,
                email: true,
                profile: {
                  select: {
                    fullName: true,
                    avatarUrl: true,
                    grade: true,
                    section: true
                  }
                }
              }
            }
          },
          orderBy: { submittedAt: 'desc' }
        }
      }
    });

    if (!assignment) {
      return sendError(res, 'Assignment not found.', 404);
    }

    const mySubmission = !isTeacherOrAdmin && req.user
      ? assignment.submissions.find((s) => s.studentId === req.user?.id) || null
      : null;

    return sendSuccess(res, 'Assignment details retrieved.', {
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      subject: assignment.subject,
      grade: assignment.grade,
      dueDate: assignment.dueDate,
      maxPoints: assignment.maxPoints,
      attachmentUrl: assignment.attachmentUrl,
      creator: assignment.creator,
      createdAt: assignment.createdAt,
      submissions: isTeacherOrAdmin ? assignment.submissions : undefined,
      mySubmission
    });
  } catch (error: any) {
    return sendError(res, 'Failed to fetch assignment.', 500);
  }
};

export const createAssignment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, subject, grade, dueDate, maxPoints, attachmentUrl } = req.body;

    if (!title || !description || !subject || !grade || !dueDate) {
      return sendError(res, 'Title, description, subject, grade, and due date are required.', 400);
    }

    const due = new Date(dueDate);
    if (isNaN(due.getTime())) {
      return sendError(res, 'Invalid due date format.', 400);
    }

    const assignment = await prisma.assignment.create({
      data: {
        creatorId: req.user!.id,
        title,
        description,
        subject,
        grade,
        dueDate: due,
        maxPoints: Number(maxPoints) || 100,
        attachmentUrl: attachmentUrl || null
      }
    });

    return sendSuccess(res, 'Assignment posted successfully.', assignment, 201);
  } catch (error: any) {
    return sendError(res, 'Failed to create assignment.', 500);
  }
};

export const submitAssignment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { content, attachmentUrl } = req.body;

    if (!content && !attachmentUrl) {
      return sendError(res, 'Either written response or attachment URL is required.', 400);
    }

    const assignment = await prisma.assignment.findUnique({ where: { id } });
    if (!assignment) {
      return sendError(res, 'Assignment not found.', 404);
    }

    const now = new Date();
    const isLate = now > assignment.dueDate;

    const submission = await prisma.assignmentSubmission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId: id,
          studentId: req.user!.id
        }
      },
      update: {
        content: content || '',
        attachmentUrl: attachmentUrl || null,
        status: isLate ? 'LATE' : 'PENDING',
        submittedAt: now
      },
      create: {
        assignmentId: id,
        studentId: req.user!.id,
        content: content || '',
        attachmentUrl: attachmentUrl || null,
        status: isLate ? 'LATE' : 'PENDING',
        submittedAt: now
      }
    });

    return sendSuccess(res, isLate ? 'Assignment submitted (marked Late).' : 'Assignment submitted successfully!', submission);
  } catch (error: any) {
    return sendError(res, 'Failed to submit assignment.', 500);
  }
};

export const gradeSubmission = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const submissionId = req.params.submissionId as string;
    const { grade, feedback } = req.body;

    if (typeof grade !== 'number' || grade < 0) {
      return sendError(res, 'Valid numerical score is required.', 400);
    }

    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: { assignment: true }
    });

    if (!submission) {
      return sendError(res, 'Submission not found.', 404);
    }

    if (grade > submission.assignment.maxPoints) {
      return sendError(res, `Grade cannot exceed max points of ${submission.assignment.maxPoints}.`, 400);
    }

    const updated = await prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        grade,
        feedback: feedback || '',
        status: 'GRADED',
        gradedAt: new Date()
      }
    });

    return sendSuccess(res, 'Submission graded and feedback provided successfully.', updated);
  } catch (error: any) {
    return sendError(res, 'Failed to grade submission.', 500);
  }
};

export const deleteAssignment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const assignment = await prisma.assignment.findUnique({ where: { id } });
    if (!assignment) return sendError(res, 'Assignment not found.', 404);

    if (assignment.creatorId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return sendError(res, 'Unauthorized to delete this assignment.', 403);
    }

    await prisma.assignment.delete({ where: { id } });
    return sendSuccess(res, 'Assignment deleted successfully.');
  } catch (error: any) {
    return sendError(res, 'Failed to delete assignment.', 500);
  }
};
