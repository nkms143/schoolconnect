import { api } from './api';

export interface VisitorStats {
  totalVisits: number;
  updatedAt?: string;
}

export const analyticsService = {
  async getOrRecordVisit(): Promise<number> {
    try {
      const hasTracked = sessionStorage.getItem('sc_session_visited');
      if (!hasTracked) {
        const res = await api.post<{ totalVisits: number }>('/api/v1/analytics/visit');
        sessionStorage.setItem('sc_session_visited', 'true');
        if (res.data?.totalVisits) {
          return res.data.totalVisits;
        }
      }

      const statsRes = await api.get<{ totalVisits: number }>('/api/v1/analytics/stats');
      return statsRes.data?.totalVisits || 1250;
    } catch (err) {
      console.warn('Visitor counter fetch failed, using fallback:', err);
      return 1250;
    }
  }
};

