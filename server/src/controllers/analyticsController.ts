import { Request, Response } from 'express';
import prisma from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const recordVisit = async (req: Request, res: Response) => {
  try {
    const metric = await prisma.siteMetric.upsert({
      where: { key: 'total_visitors' },
      update: {
        value: { increment: 1 }
      },
      create: {
        key: 'total_visitors',
        value: 1
      }
    });

    return sendSuccess(res, 'Visit recorded successfully', {
      totalVisits: metric.value,
      updatedAt: metric.updatedAt
    });
  } catch (error: any) {
    console.error('Error recording visit:', error);
    return sendError(res, 'Failed to record visit', 500, error.message);
  }
};

export const getStats = async (req: Request, res: Response) => {
  try {
    let metric = await prisma.siteMetric.findUnique({
      where: { key: 'total_visitors' }
    });

    if (!metric) {
      metric = await prisma.siteMetric.create({
        data: {
          key: 'total_visitors',
          value: 0
        }
      });
    }

    return sendSuccess(res, 'Stats fetched successfully', {
      totalVisits: metric.value,
      updatedAt: metric.updatedAt
    });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return sendError(res, 'Failed to fetch stats', 500, error.message);
  }
};

