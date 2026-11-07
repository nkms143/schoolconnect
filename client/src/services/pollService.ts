import { api } from './api';
import { Poll } from '../types';

export const pollService = {
  getPolls: async () => {
    const res = await api.get<Poll[]>('/api/v1/polls');
    return res.data || [];
  },

  createPoll: async (question: string, options: string[], expiresDays = 7) => {
    const res = await api.post<Poll>('/api/v1/polls', { question, options, expiresDays });
    return res.data;
  },

  vote: async (pollId: string, optionId: string) => {
    const res = await api.post<any>(`/api/v1/polls/${pollId}/vote`, { optionId });
    return res.data;
  }
};
