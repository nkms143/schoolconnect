import { api, getAuthToken, BASE_URL } from './api';
import { Post, Comment } from '../types';

export const postService = {
  getFeed: async (params?: { clubId?: string; hashtag?: string; authorId?: string; page?: number }) => {
    const query = new URLSearchParams();
    if (params?.clubId) query.append('clubId', params.clubId);
    if (params?.hashtag) query.append('hashtag', params.hashtag);
    if (params?.authorId) query.append('authorId', params.authorId);
    if (params?.page) query.append('page', params.page.toString());

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await api.get<Post[]>(`/api/v1/posts/feed${queryString}`);
    return res.data || [];
  },

  createPost: async (payload: {
    content: string;
    imageUrl?: string;
    clubId?: string;
    hashtags?: string;
  }) => {
    const res = await api.post<Post>('/api/v1/posts', payload);
    return res.data;
  },

  toggleLike: async (postId: string) => {
    const res = await api.post<{ isLiked: boolean; likesCount: number }>(`/api/v1/posts/${postId}/like`);
    return res.data;
  },

  addComment: async (postId: string, content: string) => {
    const res = await api.post<{ comment: Comment; commentsCount: number }>(`/api/v1/posts/${postId}/comments`, {
      content
    });
    return res.data;
  },

  getComments: async (postId: string) => {
    const res = await api.get<Comment[]>(`/api/v1/posts/${postId}/comments`);
    return res.data || [];
  },

  deletePost: async (postId: string) => {
    return api.delete(`/api/v1/posts/${postId}`);
  },

  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    const token = getAuthToken();
    const uploadUrl = BASE_URL ? `${BASE_URL}/api/v1/posts/upload` : '/api/v1/posts/upload';
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Image upload failed');
    }
    const returnedUrl = data.data.url;
    return (returnedUrl.startsWith('http') || !BASE_URL)
      ? returnedUrl
      : `${BASE_URL}${returnedUrl}`;
  }
};
