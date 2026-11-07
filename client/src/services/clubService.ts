import { api } from './api';
import { Club } from '../types';

export const clubService = {
  getClubs: async () => {
    const res = await api.get<Club[]>('/api/v1/clubs');
    return res.data || [];
  },

  getClubBySlug: async (slug: string) => {
    const res = await api.get<any>(`/api/v1/clubs/${slug}`);
    return res.data;
  },

  joinClub: async (clubId: string) => {
    const res = await api.post<any>(`/api/v1/clubs/${clubId}/join`);
    return res.data;
  },

  leaveClub: async (clubId: string) => {
    const res = await api.post<any>(`/api/v1/clubs/${clubId}/leave`);
    return res.data;
  },

  createDiscussion: async (clubId: string, title: string, content: string) => {
    const res = await api.post<any>(`/api/v1/clubs/${clubId}/discussions`, { title, content });
    return res.data;
  },

  createEvent: async (clubId: string, payload: { title: string; description: string; eventDate: string; location: string }) => {
    const res = await api.post<any>(`/api/v1/clubs/${clubId}/events`, payload);
    return res.data;
  }
};
