import { api } from './api';
import { Friend, FriendRequest } from '../types';

export const friendService = {
  getFriends: async () => {
    const res = await api.get<Friend[]>('/api/v1/friends');
    return res.data || [];
  },

  getPendingRequests: async () => {
    const res = await api.get<{ received: FriendRequest[]; sent: FriendRequest[] }>('/api/v1/friends/pending');
    return res.data || { received: [], sent: [] };
  },

  sendRequest: async (receiverId: string) => {
    const res = await api.post<any>('/api/v1/friends/request', { receiverId });
    return res.data;
  },

  acceptRequest: async (requestId: string) => {
    const res = await api.put<any>(`/api/v1/friends/request/${requestId}/accept`);
    return res.data;
  },

  rejectRequest: async (requestId: string) => {
    const res = await api.put<any>(`/api/v1/friends/request/${requestId}/reject`);
    return res.data;
  },

  removeFriend: async (friendshipId: string) => {
    return api.delete(`/api/v1/friends/${friendshipId}`);
  },

  getSuggestions: async () => {
    const res = await api.get<any[]>('/api/v1/users/suggestions');
    return res.data || [];
  }
};
