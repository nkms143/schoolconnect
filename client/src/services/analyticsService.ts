import { api } from './api';

export interface VisitorStats {
  totalVisits: number;
  updatedAt?: string;
}

const CACHE_KEY = 'sc_cached_visitor_count';
const SESSION_KEY = 'sc_session_visited';

export const analyticsService = {
  getCachedVisitCount(): number {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached !== null) {
        const parsed = Number(cached);
        if (!isNaN(parsed)) return parsed;
      }
    } catch {
      // Ignore localStorage access restrictions
    }
    return 0;
  },

  async getOrRecordVisit(): Promise<number> {
    try {
      const hasTracked = sessionStorage.getItem(SESSION_KEY);
      const endpoint = !hasTracked ? '/api/v1/analytics/visit' : '/api/v1/analytics/stats';

      const res = !hasTracked
        ? await api.post<{ totalVisits: number }>(endpoint)
        : await api.get<{ totalVisits: number }>(endpoint);

      if (!hasTracked) {
        sessionStorage.setItem(SESSION_KEY, 'true');
      }

      const total = res.data?.totalVisits;
      if (typeof total === 'number') {
        try {
          localStorage.setItem(CACHE_KEY, String(total));
        } catch {
          // Ignore localStorage access restrictions
        }
        return total;
      }

      return this.getCachedVisitCount();
    } catch (err) {
      console.warn('Visitor counter sync failed, using cached count:', err);
      return this.getCachedVisitCount();
    }
  }
};
