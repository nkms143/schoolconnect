import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import prisma from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getFeed = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const currentUserId = req.user?.id;
    const { clubId, hashtag, authorId, page = '1', limit = '15' } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 15;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      isModerated: false
    };

    if (clubId) {
      where.clubId = clubId as string;
    }
    if (authorId) {
      where.authorId = authorId as string;
    }
    if (hashtag) {
      where.hashtags = {
        contains: hashtag as string
      };
    }

    const posts = await prisma.post.findMany({
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
        club: {
          select: {
            id: true,
            name: true,
            slug: true,
            iconUrl: true
          }
        },
        likes: {
          select: {
            userId: true
          }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                profile: {
                  select: {
                    fullName: true,
                    avatarUrl: true
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          },
          take: 5
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limitNum
    });

    const formattedPosts = posts.map((post: any) => {
      const isLiked = currentUserId ? post.likes.some((l: any) => l.userId === currentUserId) : false;
      return {
        id: post.id,
        content: post.content,
        imageUrl: post.imageUrl,
        hashtags: post.hashtags ? post.hashtags.split(',').filter(Boolean) : [],
        createdAt: post.createdAt,
        author: post.author,
        club: post.club,
        likesCount: post._count?.likes || 0,
        commentsCount: post._count?.comments || 0,
        isLiked,
        comments: post.comments
      };
    });

    return sendSuccess(res, 'Feed retrieved.', formattedPosts);
  } catch (error: any) {
    console.error('Error fetching feed:', error);
    return sendError(res, 'Failed to retrieve social feed.', 500);
  }
};

export const createPost = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized.', 401);
    }

    const { content, imageUrl, clubId, hashtags } = req.body;

    if (!content && !imageUrl) {
      return sendError(res, 'Post must contain either text content or an image.', 400);
    }

    // Process hashtags: extract from content if not explicitly sent
    let tags = hashtags;
    if (!tags && content) {
      const extracted = content.match(/#[a-zA-Z0-9_]+/g);
      if (extracted) {
        tags = extracted.join(',');
      }
    }

    const post = await prisma.post.create({
      data: {
        authorId: req.user.id,
        content: content || '',
        imageUrl: imageUrl || null,
        clubId: clubId || null,
        hashtags: tags || null
      },
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
        club: {
          select: {
            id: true,
            name: true,
            slug: true,
            iconUrl: true
          }
        }
      }
    });

    return sendSuccess(
      res,
      'Post published successfully!',
      {
        ...post,
        hashtags: post.hashtags ? post.hashtags.split(',').filter(Boolean) : [],
        likesCount: 0,
        commentsCount: 0,
        isLiked: false,
        comments: []
      },
      201
    );
  } catch (error: any) {
    return sendError(res, 'Failed to create post.', 500);
  }
};

export const toggleLike = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized.', 401);
    }
    const postId = req.params.postId as string;
    const userId = req.user.id;

    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId
        }
      }
    });

    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id }
      });
      const likesCount = await prisma.like.count({ where: { postId } });
      return sendSuccess(res, 'Post unliked.', { isLiked: false, likesCount });
    } else {
      await prisma.like.create({
        data: {
          postId,
          userId
        }
      });
      const likesCount = await prisma.like.count({ where: { postId } });
      return sendSuccess(res, 'Post liked!', { isLiked: true, likesCount });
    }
  } catch (error: any) {
    return sendError(res, 'Failed to like/unlike post.', 500);
  }
};

export const addComment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized.', 401);
    }
    const postId = req.params.postId as string;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return sendError(res, 'Comment content cannot be empty.', 400);
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        authorId: req.user.id,
        content: content.trim()
      },
      include: {
        author: {
          select: {
            id: true,
            profile: {
              select: {
                fullName: true,
                avatarUrl: true
              }
            }
          }
        }
      }
    });

    const commentsCount = await prisma.comment.count({ where: { postId } });

    return sendSuccess(res, 'Comment posted.', { comment, commentsCount }, 201);
  } catch (error: any) {
    return sendError(res, 'Failed to add comment.', 500);
  }
};

export const getComments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const postId = req.params.postId as string;

    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        author: {
          select: {
            id: true,
            profile: {
              select: {
                fullName: true,
                avatarUrl: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return sendSuccess(res, 'Comments retrieved.', comments);
  } catch (error: any) {
    return sendError(res, 'Failed to get comments.', 500);
  }
};

export const deletePost = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized.', 401);
    }
    const postId = req.params.postId as string;

    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return sendError(res, 'Post not found.', 404);
    }

    // Only author, teacher, or admin can delete post
    if (post.authorId !== req.user.id && req.user.role !== 'ADMIN' && req.user.role !== 'TEACHER') {
      return sendError(res, 'You do not have permission to delete this post.', 403);
    }

    await prisma.post.delete({
      where: { id: postId }
    });

    return sendSuccess(res, 'Post deleted successfully.');
  } catch (error: any) {
    return sendError(res, 'Failed to delete post.', 500);
  }
};
