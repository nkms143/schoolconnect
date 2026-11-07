import { api } from './api';
import { Announcement } from '../types';

export const noticeService = {
  getAnnouncements: async (category?: string, priority?: string) => {
    const query = new URLSearchParams();
    if (category) query.append('category', category);
    if (priority) query.append('priority', priority);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await api.get<Announcement[]>(`/api/v1/announcements${queryString}`);
    return res.data || [];
  },

  createAnnouncement: async (payload: {
    title: string;
    content: string;
    category: string;
    priority: string;
    targetGrade?: string;
  }) => {
    const res = await api.post<Announcement>('/api/v1/announcements', payload);
    return res.data;
  },

  deleteAnnouncement: async (id: string) => {
    return api.delete(`/api/v1/announcements/${id}`);
  }
};
