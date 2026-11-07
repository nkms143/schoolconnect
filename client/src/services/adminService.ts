import { api } from './api';
import { AdminStats, User } from '../types';

export const adminService = {
  getStats: async () => {
    const res = await api.get<AdminStats>('/api/v1/admin/stats');
    return res.data;
  },

  getAllUsers: async (role?: string, search?: string) => {
    const query = new URLSearchParams();
    if (role) query.append('role', role);
    if (search) query.append('search', search);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await api.get<User[]>(`/api/v1/admin/users${queryString}`);
    return res.data || [];
  },

  toggleUserBlock: async (userId: string) => {
    const res = await api.put<User>(`/api/v1/admin/users/${userId}/toggle-block`);
    return res.data;
  },

  createNewClub: async (payload: {
    name: string;
    category: string;
    description: string;
    bannerUrl?: string;
    iconUrl?: string;
  }) => {
    const res = await api.post<any>('/api/v1/admin/clubs', payload);
    return res.data;
  },

  getReports: async () => {
    const res = await api.get<any[]>('/api/v1/admin/reports');
    return res.data || [];
  },

  reportContent: async (targetType: 'POST' | 'USER' | 'COMMENT', targetId: string, reason: string) => {
    const res = await api.post<any>('/api/v1/admin/reports', { targetType, targetId, reason });
    return res.data;
  }
};
