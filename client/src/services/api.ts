let rawBase = (import.meta.env.VITE_API_URL || '').trim();
if (rawBase && !rawBase.startsWith('http://') && !rawBase.startsWith('https://')) {
  rawBase = `https://${rawBase}`;
}
if (rawBase) {
  try {
    const urlObj = new URL(rawBase);
    if (!urlObj.hostname.includes('.') && urlObj.hostname !== 'localhost') {
      urlObj.hostname = `${urlObj.hostname}.onrender.com`;
      rawBase = urlObj.origin;
    }
  } catch {}
}
export const BASE_URL = rawBase;

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
}

export const getAuthToken = (): string | null => {
  return localStorage.getItem('schoolconnect_token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('schoolconnect_token', token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('schoolconnect_token');
};

export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAuthToken();
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        removeAuthToken();
      }
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error: any) {
    throw error;
  }
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body?: any) =>
    request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined
    }),
  put: <T>(endpoint: string, body?: any) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined
    }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' })
};
