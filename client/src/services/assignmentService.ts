import { api } from './api';
import { Assignment, AssignmentDetail } from '../types/academic';

export const assignmentService = {
  getAssignments: async (params?: { grade?: string; subject?: string }) => {
    const query = new URLSearchParams();
    if (params?.grade && params.grade !== 'ALL') query.set('grade', params.grade);
    if (params?.subject && params.subject !== 'ALL') query.set('subject', params.subject);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await api.get<Assignment[]>(`/api/v1/assignments${qs}`);
    return res.data || [];
  },

  getAssignmentById: async (id: string) => {
    const res = await api.get<AssignmentDetail>(`/api/v1/assignments/${id}`);
    return res.data;
  },

  createAssignment: async (payload: {
    title: string;
    description: string;
    subject: string;
    grade: string;
    dueDate: string;
    maxPoints?: number;
    attachmentUrl?: string;
  }) => {
    const res = await api.post<Assignment>('/api/v1/assignments', payload);
    return res.data;
  },

  submitAssignment: async (id: string, payload: { content?: string; attachmentUrl?: string }) => {
    const res = await api.post(`/api/v1/assignments/${id}/submit`, payload);
    return res.data;
  },

  gradeSubmission: async (submissionId: string, payload: { grade: number; feedback?: string }) => {
    const res = await api.post(`/api/v1/assignments/submissions/${submissionId}/grade`, payload);
    return res.data;
  },

  deleteAssignment: async (id: string) => {
    return api.delete(`/api/v1/assignments/${id}`);
  }
};

