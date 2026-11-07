import { api, setAuthToken, removeAuthToken } from './api';
import { User } from '../types';

export const authService = {
  login: async (email: string, password: string) => {
    const res = await api.post<{ token: string; user: User }>('/api/v1/auth/login', {
      email,
      password
    });
    if (res.data?.token) {
      setAuthToken(res.data.token);
    }
    return res.data;
  },

  register: async (payload: {
    email: string;
    password: string;
    fullName: string;
    grade?: string;
    section?: string;
    role?: string;
  }) => {
    const res = await api.post<{ token: string; user: User }>('/api/v1/auth/register', payload);
    if (res.data?.token) {
      setAuthToken(res.data.token);
    }
    return res.data;
  },

  getMe: async () => {
    const res = await api.get<{ user: User }>('/api/v1/auth/me');
    return res.data?.user;
  },

  verifyEmail: async (token: string, email?: string) => {
    return api.post('/api/v1/auth/verify-email', { token, email });
  },

  forgotPassword: async (email: string) => {
    return api.post<{ demoResetToken?: string }>('/api/v1/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, newPassword: string) => {
    return api.post('/api/v1/auth/reset-password', { token, newPassword });
  },

  logout: () => {
    removeAuthToken();
  }
};
