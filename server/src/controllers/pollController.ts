import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import prisma from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getPolls = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const currentUserId = req.user?.id;

    const polls = await prisma.poll.findMany({
      include: {
        creator: {
          select: {
            id: true,
            role: true,
            profile: { select: { fullName: true, avatarUrl: true } }
          }
        },
        options: {
          include: {
            _count: {
              select: { votes: true }
            }
          }
        },
        votes: currentUserId
          ? {
              where: { userId: currentUserId },
              select: { optionId: true }
            }
          : false,
        _count: {
          select: { votes: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = polls.map((poll: any) => {
      const totalVotes = poll._count?.votes || 0;
      const userVote = poll.votes && poll.votes.length > 0 ? poll.votes[0].optionId : null;
      const isExpired = poll.expiresAt ? new Date(poll.expiresAt) < new Date() : false;

      return {
        id: poll.id,
        question: poll.question,
        createdAt: poll.createdAt,
        expiresAt: poll.expiresAt,
        isClosed: poll.isClosed || isExpired,
        creator: poll.creator,
        totalVotes,
        hasVoted: !!userVote,
        userVotedOptionId: userVote,
        options: (poll.options || []).map((opt: any) => ({
          id: opt.id,
          text: opt.text,
          votesCount: opt._count?.votes || 0,
          percentage: totalVotes > 0 ? Math.round(((opt._count?.votes || 0) / totalVotes) * 100) : 0
        }))
      };
    });

    return sendSuccess(res, 'Polls retrieved.', formatted);
  } catch (error: any) {
    return sendError(res, 'Failed to retrieve polls.', 500);
  }
};

export const createPoll = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized.', 401);
    }
    const { question, options, expiresDays = 7 } = req.body;

    if (!question || !Array.isArray(options) || options.length < 2) {
      return sendError(res, 'A question and at least two options are required.', 400);
    }

    const expiresAt = new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000);

    const poll = await prisma.poll.create({
      data: {
        creatorId: req.user.id,
        question,
        expiresAt,
        options: {
          create: options.map((text: string) => ({ text: text.trim() }))
        }
      },
      include: {
        creator: {
          select: {
            id: true,
            role: true,
            profile: { select: { fullName: true, avatarUrl: true } }
          }
        },
        options: {
          include: {
            _count: {
              select: { votes: true }
            }
          }
        }
      }
    });

    return sendSuccess(
      res,
      'Poll created successfully!',
      {
        id: poll.id,
        question: poll.question,
        createdAt: poll.createdAt,
        expiresAt: poll.expiresAt,
        isClosed: false,
        creator: poll.creator,
        totalVotes: 0,
        hasVoted: false,
        userVotedOptionId: null,
        options: poll.options.map((o: any) => ({
          id: o.id,
          text: o.text,
          votesCount: 0,
          percentage: 0
        }))
      },
      201
    );
  } catch (error: any) {
    return sendError(res, 'Failed to create poll.', 500);
  }
};

export const votePoll = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized.', 401);
    }
    const pollId = req.params.pollId as string;
    const { optionId } = req.body;
    const userId = req.user.id;

    if (!optionId) {
      return sendError(res, 'Option ID is required.', 400);
    }

    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: { options: true }
    });

    if (!poll) {
      return sendError(res, 'Poll not found.', 404);
    }

    if (poll.isClosed || (poll.expiresAt && new Date(poll.expiresAt) < new Date())) {
      return sendError(res, 'This poll has concluded and no longer accepts votes.', 400);
    }

    // Verify option belongs to this poll
    const validOption = poll.options.find(o => o.id === optionId);
    if (!validOption) {
      return sendError(res, 'Invalid poll option.', 400);
    }

    // Check if student already voted (Vote once per student)
    const existingVote = await prisma.vote.findUnique({
      where: { pollId_userId: { pollId, userId } }
    });

    if (existingVote) {
      return sendError(res, 'You have already voted in this school poll. Voting is limited to once per student.', 400);
    }

    await prisma.vote.create({
      data: {
        pollId,
        optionId,
        userId
      }
    });

    // Return updated poll statistics
    const updatedOptions = await prisma.pollOption.findMany({
      where: { pollId },
      include: {
        _count: {
          select: { votes: true }
        }
      }
    });

    const totalVotes = await prisma.vote.count({ where: { pollId } });

    const formattedOptions = updatedOptions.map((opt: any) => ({
      id: opt.id,
      text: opt.text,
      votesCount: opt._count?.votes || 0,
      percentage: totalVotes > 0 ? Math.round(((opt._count?.votes || 0) / totalVotes) * 100) : 0
    }));

    return sendSuccess(res, 'Vote cast successfully!', {
      pollId,
      totalVotes,
      hasVoted: true,
      userVotedOptionId: optionId,
      options: formattedOptions
    });
  } catch (error: any) {
    return sendError(res, 'Failed to cast vote.', 500);
  }
};
