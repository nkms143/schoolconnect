import { api } from './api';
import {
  Quiz,
  QuizDetail,
  QuizLeaderboardResponse,
  GlobalLeaderboardEntry
} from '../types/academic';

export const quizService = {
  getQuizzes: async (params?: { subject?: string; grade?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.subject && params.subject !== 'ALL') query.set('subject', params.subject);
    if (params?.grade && params.grade !== 'ALL') query.set('grade', params.grade);
    if (params?.status && params.status !== 'ALL') query.set('status', params.status);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await api.get<Quiz[]>(`/api/v1/quizzes${qs}`);
    return res.data || [];
  },

  getQuizById: async (id: string) => {
    const res = await api.get<QuizDetail>(`/api/v1/quizzes/${id}`);
    return res.data;
  },

  createQuiz: async (payload: {
    title: string;
    description: string;
    subject: string;
    grade: string;
    startDate: string;
    endDate: string;
    questions: Array<{
      questionText: string;
      options: string[];
      correctIndex: number;
      points?: number;
    }>;
  }) => {
    const res = await api.post<Quiz>('/api/v1/quizzes', payload);
    return res.data;
  },

  submitQuiz: async (id: string, answers: Array<{ questionId: string; selectedIndex: number }>) => {
    const res = await api.post<{
      submissionId: string;
      score: number;
      maxScore: number;
      isResultsReleased: boolean;
    }>(`/api/v1/quizzes/${id}/submit`, { answers });
    return res;
  },

  getQuizLeaderboard: async (id: string) => {
    const res = await api.get<QuizLeaderboardResponse>(`/api/v1/quizzes/${id}/leaderboard`);
    return res.data;
  },

  getGlobalLeaderboard: async () => {
    const res = await api.get<GlobalLeaderboardEntry[]>('/api/v1/quizzes/leaderboard/global');
    return res.data || [];
  },

  deleteQuiz: async (id: string) => {
    return api.delete(`/api/v1/quizzes/${id}`);
  }
};

