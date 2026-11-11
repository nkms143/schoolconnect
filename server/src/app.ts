import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { ENV } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import clubRoutes from './routes/clubRoutes.js';
import pollRoutes from './routes/pollRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import friendRoutes from './routes/friendRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

export const createApp = (): Application => {
  const app = express();

  // CORS configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or same-origin)
        if (!origin) return callback(null, true);
        if (
          ENV.CLIENT_URL === '*' ||
          origin === ENV.CLIENT_URL ||
          origin === `https://${ENV.CLIENT_URL}` ||
          origin.endsWith('.onrender.com') ||
          origin.includes('localhost') ||
          origin.includes('127.0.0.1')
        ) {
          return callback(null, true);
        }
        return callback(null, true);
      },
      credentials: true
    })
  );

  // Parsing middlewares
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Static uploads directory
  const uploadsPath = path.resolve(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadsPath));

  // Root status
  app.get('/', (req: Request, res: Response) => {
    res.json({
      success: true,
      service: 'SchoolConnect API',
      status: 'online',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  });

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      service: 'SchoolConnect API',
      timestamp: new Date().toISOString()
    });
  });

  // API Routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/users', userRoutes);
  app.use('/api/v1/posts', postRoutes);
  app.use('/api/v1/clubs', clubRoutes);
  app.use('/api/v1/polls', pollRoutes);
  app.use('/api/v1/announcements', announcementRoutes);
  app.use('/api/v1/friends', friendRoutes);
  app.use('/api/v1/messages', messageRoutes);
  app.use('/api/v1/admin', adminRoutes);
  app.use('/api/v1/quizzes', quizRoutes);
  app.use('/api/v1/assignments', assignmentRoutes);
  app.use('/api/v1/notes', noteRoutes);
  app.use('/api/v1/analytics', analyticsRoutes);

  // Fallback 404
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: `Endpoint ${req.method} ${req.originalUrl} not found.`
    });
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
};

export default createApp;
