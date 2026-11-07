import { api } from './api';
import { Conversation, Message } from '../types';

export const messageService = {
  getConversations: async () => {
    const res = await api.get<Conversation[]>('/api/v1/messages/conversations');
    return res.data || [];
  },

  getMessages: async (targetUserId: string) => {
    const res = await api.get<Message[]>(`/api/v1/messages/user/${targetUserId}`);
    return res.data || [];
  },

  sendMessage: async (receiverId: string, content: string) => {
    const res = await api.post<Message>('/api/v1/messages', { receiverId, content });
    return res.data;
  }
};
