import { api } from './api';
import { StudyNote } from '../types/academic';

export const noteService = {
  getNotes: async (params?: {
    subject?: string;
    grade?: string;
    search?: string;
    sortBy?: 'helpful' | 'recent';
  }) => {
    const query = new URLSearchParams();
    if (params?.subject && params.subject !== 'ALL') query.set('subject', params.subject);
    if (params?.grade && params.grade !== 'ALL') query.set('grade', params.grade);
    if (params?.search) query.set('search', params.search);
    if (params?.sortBy) query.set('sortBy', params.sortBy);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await api.get<StudyNote[]>(`/api/v1/notes${qs}`);
    return res.data || [];
  },

  createNote: async (payload: {
    title: string;
    description: string;
    subject: string;
    grade: string;
    chapter?: string;
    fileUrl: string;
    fileType?: string;
  }) => {
    const res = await api.post<StudyNote>('/api/v1/notes', payload);
    return res.data;
  },

  toggleHelpfulVote: async (id: string) => {
    const res = await api.post<{
      noteId: string;
      helpfulCount: number;
      hasVoted: boolean;
    }>(`/api/v1/notes/${id}/vote`);
    return res.data;
  },

  deleteNote: async (id: string) => {
    return api.delete(`/api/v1/notes/${id}`);
  }
};

