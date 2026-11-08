import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../config/db.js';
import { generateToken } from '../utils/jwt.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, grade, section, role } = req.body;

    if (!email || !password || !fullName) {
      return sendError(res, 'Email, password, and full name are required.', 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendError(res, 'Please provide a valid email address.', 400);
    }

    if (password.length < 6) {
      return sendError(res, 'Password must be at least 6 characters long.', 400);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      return sendError(res, 'An account with this email already exists.', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Default avatar
    const defaultAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fullName)}`;

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        // Public registration allows STUDENT or TEACHER; ADMIN cannot be self-assigned
        role: role === 'TEACHER' ? 'TEACHER' : 'STUDENT',
        isVerified: true, // Auto-verified for ease of demo, token kept for manual verification flow test
        verificationToken,
        profile: {
          create: {
            fullName,
            grade: grade || '10th',
            section: section || 'Section A',
            avatarUrl: defaultAvatar,
            bio: 'Hello! I am a student at Greenfield High School.',
            interests: 'Academics, Technology, School Events'
          }
        }
      },
      include: {
        profile: true
      }
    });

    // Send verification email simulation
    await sendVerificationEmail(user.email, verificationToken);

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    return sendSuccess(
      res,
      'Registration successful! Welcome to SchoolConnect.',
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          profile: user.profile
        }
      },
      201
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return sendError(res, error.message || 'Registration failed.', 500);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Email and password are required.', 400);
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        profile: true
      }
    });

    if (!user) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    if (user.isBlocked) {
      return sendError(res, 'This account has been suspended by administration.', 403);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    return sendSuccess(res, 'Login successful!', {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profile: user.profile
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return sendError(res, 'Login failed.', 500);
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized.', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        profile: true,
        clubMemberships: {
          include: {
            club: true
          }
        }
      }
    });

    if (!user) {
      return sendError(res, 'User not found.', 404);
    }

    return sendSuccess(res, 'User fetched successfully.', {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        isBlocked: user.isBlocked,
        profile: user.profile,
        clubs: user.clubMemberships.map(cm => ({
          id: cm.club.id,
          name: cm.club.name,
          slug: cm.club.slug,
          role: cm.role
        }))
      }
    });
  } catch (error: any) {
    return sendError(res, 'Failed to fetch user.', 500);
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token, email } = req.body;

    if (!token && !email) {
      return sendError(res, 'Verification token or email required.', 400);
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { verificationToken: token },
          { email: email?.toLowerCase().trim() }
        ]
      }
    });

    if (!user) {
      return sendError(res, 'Invalid or expired verification link.', 400);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null
      }
    });

    return sendSuccess(res, 'Email verified successfully! You can now access all features.');
  } catch (error: any) {
    return sendError(res, 'Email verification failed.', 500);
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return sendError(res, 'Email address is required.', 400);
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      // Return success to avoid email enumeration
      return sendSuccess(res, 'If this email is registered, a password reset link has been dispatched.');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires
      }
    });

    await sendPasswordResetEmail(user.email, resetToken);

    return sendSuccess(res, 'Password reset email sent! Please check your inbox or the server log in development mode.', {
      demoResetToken: resetToken // Helpful for local testing
    });
  } catch (error: any) {
    return sendError(res, 'Failed to process password reset request.', 500);
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return sendError(res, 'Token and new password are required.', 400);
    }

    if (newPassword.length < 6) {
      return sendError(res, 'Password must be at least 6 characters long.', 400);
    }

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return sendError(res, 'Password reset token is invalid or has expired.', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      }
    });

    return sendSuccess(res, 'Password reset successfully! You can now log in with your new password.');
  } catch (error: any) {
    return sendError(res, 'Password reset failed.', 500);
  }
};
