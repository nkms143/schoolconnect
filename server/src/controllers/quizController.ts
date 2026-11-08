import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import prisma from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getQuizzes = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { subject, grade, status } = req.query as {
      subject?: string;
      grade?: string;
      status?: string;
    };

    const where: any = {};
    if (subject && subject !== 'ALL') where.subject = subject;
    if (grade && grade !== 'ALL') where.grade = grade;

    const quizzes = await prisma.quiz.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            role: true,
            profile: {
              select: {
                fullName: true,
                avatarUrl: true
              }
            }
          }
        },
        questions: {
          select: { id: true, points: true }
        },
        submissions: {
          select: {
            id: true,
            studentId: true,
            score: true,
            maxScore: true,
            completedAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const now = new Date();

    const formattedQuizzes = quizzes.map((q) => {
      let computedStatus: 'UPCOMING' | 'ACTIVE' | 'ENDED' = 'ACTIVE';
      if (now < q.startDate) {
        computedStatus = 'UPCOMING';
      } else if (now > q.endDate) {
        computedStatus = 'ENDED';
      }

      const userSubmission = req.user
        ? q.submissions.find((s) => s.studentId === req.user?.id)
        : null;

      return {
        id: q.id,
        title: q.title,
        description: q.description,
        subject: q.subject,
        grade: q.grade,
        totalPoints: q.totalPoints,
        status: computedStatus,
        startDate: q.startDate,
        endDate: q.endDate,
        isResultsReleased: q.isResultsReleased || now >= q.endDate,
        questionsCount: q.questions.length,
        submissionsCount: q.submissions.length,
        creator: q.creator,
        hasSubmitted: Boolean(userSubmission),
        userScore: userSubmission?.score ?? null,
        userMaxScore: userSubmission?.maxScore ?? null,
        createdAt: q.createdAt
      };
    });

    const filtered = status && status !== 'ALL'
      ? formattedQuizzes.filter((q) => q.status === status)
      : formattedQuizzes;

    return sendSuccess(res, 'Quizzes fetched successfully.', filtered);
  } catch (error: any) {
    return sendError(res, 'Failed to fetch quizzes.', 500);
  }
};

export const getQuizById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        creator: {
          include: { profile: true }
        },
        questions: {
          orderBy: { order: 'asc' }
        },
        submissions: {
          include: {
            answers: true
          }
        }
      }
    });

    if (!quiz) {
      return sendError(res, 'Quiz not found.', 404);
    }

    const now = new Date();
    let computedStatus: 'UPCOMING' | 'ACTIVE' | 'ENDED' = 'ACTIVE';
    if (now < quiz.startDate) {
      computedStatus = 'UPCOMING';
    } else if (now > quiz.endDate) {
      computedStatus = 'ENDED';
    }

    const isResultsReleased = quiz.isResultsReleased || computedStatus === 'ENDED';
    const isPrivileged = req.user?.role === 'ADMIN' || req.user?.role === 'TEACHER';
    const userSubmission = req.user
      ? quiz.submissions.find((s) => s.studentId === req.user?.id) || null
      : null;

    // Sanitize questions: only reveal correct answers if quiz ended or user is teacher/admin
    const questions = quiz.questions.map((q) => ({
      id: q.id,
      questionText: q.questionText,
      options: q.options,
      points: q.points,
      order: q.order,
      // Hide correct answer during ongoing test for students
      correctIndex: (isResultsReleased || isPrivileged) ? q.correctIndex : undefined
    }));

    return sendSuccess(res, 'Quiz retrieved successfully.', {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      subject: quiz.subject,
      grade: quiz.grade,
      totalPoints: quiz.totalPoints,
      status: computedStatus,
      startDate: quiz.startDate,
      endDate: quiz.endDate,
      isResultsReleased,
      creator: quiz.creator,
      questions,
      hasSubmitted: Boolean(userSubmission),
      submission: userSubmission
        ? {
            id: userSubmission.id,
            score: userSubmission.score,
            maxScore: userSubmission.maxScore,
            completedAt: userSubmission.completedAt,
            answers: isResultsReleased || isPrivileged ? userSubmission.answers : undefined
          }
        : null
    });
  } catch (error: any) {
    return sendError(res, 'Failed to fetch quiz details.', 500);
  }
};

export const createQuiz = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      title,
      description,
      subject,
      grade,
      startDate,
      endDate,
      questions
    } = req.body;

    if (!title || !description || !subject || !grade || !startDate || !endDate) {
      return sendError(res, 'All required quiz fields must be provided.', 400);
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return sendError(res, 'At least one multiple choice question is required.', 400);
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return sendError(res, 'Invalid start or end date format.', 400);
    }

    if (end <= start) {
      return sendError(res, 'Competition end date must be after start date.', 400);
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText || !Array.isArray(q.options) || q.options.length < 2) {
        return sendError(res, `Question #${i + 1} must have valid text and at least 2 options.`, 400);
      }
      if (typeof q.correctIndex !== 'number' || q.correctIndex < 0 || q.correctIndex >= q.options.length) {
        return sendError(res, `Question #${i + 1} has an invalid correct answer index.`, 400);
      }
    }

    const totalPoints = questions.reduce((sum: number, q: any) => sum + (Number(q.points) || 10), 0);

    const quiz = await prisma.quiz.create({
      data: {
        creatorId: req.user!.id,
        title,
        description,
        subject,
        grade,
        totalPoints,
        startDate: start,
        endDate: end,
        questions: {
          create: questions.map((q: any, idx: number) => ({
            questionText: q.questionText,
            options: q.options,
            correctIndex: q.correctIndex,
            points: Number(q.points) || 10,
            order: idx
          }))
        }
      },
      include: {
        questions: true
      }
    });

    return sendSuccess(res, 'Quiz competition created successfully.', quiz, 201);
  } catch (error: any) {
    return sendError(res, 'Failed to create quiz competition.', 500);
  }
};

export const submitQuiz = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { answers } = req.body as {
      answers: Array<{ questionId: string; selectedIndex: number }>;
    };

    if (!Array.isArray(answers)) {
      return sendError(res, 'Answers array is required.', 400);
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: { questions: true }
    });

    if (!quiz) {
      return sendError(res, 'Quiz not found.', 404);
    }

    const now = new Date();
    if (now < quiz.startDate) {
      return sendError(res, 'This quiz competition has not started yet.', 400);
    }
    if (now > quiz.endDate) {
      return sendError(res, 'This quiz competition has concluded. Submissions are closed.', 400);
    }

    // Check if user already submitted (1 attempt enforced)
    const existing = await prisma.quizSubmission.findUnique({
      where: {
        quizId_studentId: {
          quizId: id,
          studentId: req.user!.id
        }
      }
    });

    if (existing) {
      return sendError(res, 'You have already submitted this competition quiz. Multiple attempts are not permitted.', 400);
    }

    // Grade answers
    let totalScore = 0;
    const answerRecords: Array<{
      questionId: string;
      selectedIndex: number;
      isCorrect: boolean;
      pointsAwarded: number;
    }> = [];

    const questionMap = new Map<string, (typeof quiz.questions)[0]>();
    for (const q of quiz.questions) {
      questionMap.set(q.id, q);
    }

    for (const ans of answers) {
      const q = questionMap.get(ans.questionId);
      if (!q) continue;

      const isCorrect = ans.selectedIndex === q.correctIndex;
      const pointsAwarded = isCorrect ? q.points : 0;
      totalScore += pointsAwarded;

      answerRecords.push({
        questionId: q.id,
        selectedIndex: ans.selectedIndex,
        isCorrect,
        pointsAwarded
      });
    }

    const submission = await prisma.quizSubmission.create({
      data: {
        quizId: id,
        studentId: req.user!.id,
        score: totalScore,
        maxScore: quiz.totalPoints,
        answers: {
          create: answerRecords
        }
      }
    });

    const isAnnounced = now >= quiz.endDate;
    const message = isAnnounced
      ? `Quiz completed! You scored ${totalScore} out of ${quiz.totalPoints}.`
      : 'Your answers have been recorded successfully! Final scores and rankings will be officially announced on ' +
        quiz.endDate.toLocaleString();

    return sendSuccess(res, message, {
      submissionId: submission.id,
      score: totalScore,
      maxScore: quiz.totalPoints,
      isResultsReleased: isAnnounced
    }, 201);
  } catch (error: any) {
    return sendError(res, 'Failed to submit quiz.', 500);
  }
};

export const getQuizLeaderboard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
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
          orderBy: [
            { score: 'desc' },
            { completedAt: 'asc' }
          ]
        }
      }
    });

    if (!quiz) {
      return sendError(res, 'Quiz not found.', 404);
    }

    const now = new Date();
    const isEnded = now >= quiz.endDate || quiz.isResultsReleased;
    const isPrivileged = req.user?.role === 'ADMIN' || req.user?.role === 'TEACHER';

    // If active and student, do not reveal rankings to prevent unfair advantage
    if (!isEnded && !isPrivileged) {
      return sendSuccess(res, 'Competition is ongoing. Official leaderboard will be revealed after end date.', {
        isCompetitionActive: true,
        quizTitle: quiz.title,
        subject: quiz.subject,
        startDate: quiz.startDate,
        endDate: quiz.endDate,
        totalParticipants: quiz.submissions.length,
        participants: []
      });
    }

    // Include ALL participants with full ranking
    const participants = quiz.submissions.map((sub, index) => {
      const percentage = sub.maxScore > 0 ? Math.round((sub.score / sub.maxScore) * 100) : 0;
      return {
        rank: index + 1,
        submissionId: sub.id,
        studentId: sub.student.id,
        fullName: sub.student.profile?.fullName || sub.student.email.split('@')[0],
        avatarUrl: sub.student.profile?.avatarUrl,
        grade: sub.student.profile?.grade || quiz.grade,
        section: sub.student.profile?.section || '',
        score: sub.score,
        maxScore: sub.maxScore,
        percentage,
        completedAt: sub.completedAt
      };
    });

    return sendSuccess(res, 'Leaderboard retrieved successfully.', {
      isCompetitionActive: false,
      quizTitle: quiz.title,
      subject: quiz.subject,
      grade: quiz.grade,
      startDate: quiz.startDate,
      endDate: quiz.endDate,
      totalParticipants: participants.length,
      participants
    });
  } catch (error: any) {
    return sendError(res, 'Failed to fetch quiz leaderboard.', 500);
  }
};

export const getGlobalLeaderboard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const submissions = await prisma.quizSubmission.findMany({
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
        },
        quiz: {
          select: {
            title: true,
            subject: true,
            endDate: true
          }
        }
      },
      orderBy: { score: 'desc' }
    });

    const studentMap = new Map<string, {
      studentId: string;
      fullName: string;
      avatarUrl?: string | null;
      grade?: string | null;
      section?: string | null;
      totalPoints: number;
      quizzesTaken: number;
      topScore: number;
      lastActive: Date;
    }>();

    for (const sub of submissions) {
      const studentId = sub.student.id;
      const existing = studentMap.get(studentId);

      if (existing) {
        existing.totalPoints += sub.score;
        existing.quizzesTaken += 1;
        if (sub.score > existing.topScore) existing.topScore = sub.score;
        if (sub.completedAt > existing.lastActive) existing.lastActive = sub.completedAt;
      } else {
        studentMap.set(studentId, {
          studentId,
          fullName: sub.student.profile?.fullName || sub.student.email.split('@')[0],
          avatarUrl: sub.student.profile?.avatarUrl,
          grade: sub.student.profile?.grade,
          section: sub.student.profile?.section,
          totalPoints: sub.score,
          quizzesTaken: 1,
          topScore: sub.score,
          lastActive: sub.completedAt
        });
      }
    }

    const sortedList = Array.from(studentMap.values())
      .sort((a, b) => b.totalPoints - a.totalPoints || b.quizzesTaken - a.quizzesTaken)
      .map((entry, idx) => ({
        rank: idx + 1,
        ...entry
      }));

    return sendSuccess(res, 'Global academic competition leaderboard retrieved.', sortedList);
  } catch (error: any) {
    return sendError(res, 'Failed to fetch global leaderboard.', 500);
  }
};

export const deleteQuiz = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const quiz = await prisma.quiz.findUnique({ where: { id } });
    if (!quiz) return sendError(res, 'Quiz not found.', 404);

    if (quiz.creatorId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return sendError(res, 'Unauthorized to delete this quiz.', 403);
    }

    await prisma.quiz.delete({ where: { id } });
    return sendSuccess(res, 'Quiz competition deleted successfully.');
  } catch (error: any) {
    return sendError(res, 'Failed to delete quiz.', 500);
  }
};
