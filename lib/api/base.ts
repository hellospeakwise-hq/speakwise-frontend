import axios, { AxiosInstance, AxiosError } from 'axios';

// API configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000',
  TIMEOUT: Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS) || 30000,
} as const;

// Create Axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/api`,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Track if we're currently refreshing the token to avoid multiple refresh requests
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest: any = error.config;
    
    // Handle token expiration
    if (error.response?.status === 401 && !originalRequest._retry) {
      const url = originalRequest?.url || '';
      
      // Don't try to refresh for public endpoints or auth endpoints
      const publicEndpoints = ['/events/', '/auth/login/', '/auth/register/'];
      const isPublicEndpoint = publicEndpoints.some(endpoint => url.includes(endpoint)) || 
                              url.match(/\/events\/\d+\/$/);
      
      if (isPublicEndpoint) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return apiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
      console.log('[API] 401 on', url, 'refreshToken?', !!refreshToken);
      
      if (!refreshToken) {
        // No refresh token, logout user
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          if (process.env.NODE_ENV === 'production') {
            window.location.href = '/signin';
          } else {
            console.warn('[API] Missing refresh token in dev; not forcing redirect');
          }
        }
        return Promise.reject(error);
      }

      try {
        // Try to refresh the token
        const response = await axios.post(`${API_CONFIG.BASE_URL}/api/auth/refresh/`, {
          refresh: refreshToken
        });

        const { access } = response.data;
        console.log('[API] token refreshed');
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', access);
        }

        // Update the failed request with new token
        originalRequest.headers['Authorization'] = 'Bearer ' + access;
        
        processQueue(null, access);
        isRefreshing = false;

        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        console.error('[API] token refresh failed', (refreshError as any)?.response?.status, (refreshError as any)?.response?.data);
        processQueue(refreshError, null);
        isRefreshing = false;
        
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          if (process.env.NODE_ENV === 'production') {
            window.location.href = '/signin';
          } else {
            console.warn('[API] Refresh failed in dev; not forcing redirect');
          }
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      throw new Error('Network error. Please check your connection.');
    }

    // Skip generic error handling for auth endpoints - let them handle their own errors
    const url = error.config?.url || '';
    const isAuthEndpoint = url.includes('/auth/login/') || url.includes('/auth/register/');
    
    if (isAuthEndpoint) {
      // Re-throw the original error for auth endpoints to handle specifically
      throw error;
    }

    // Handle API errors for non-auth endpoints
    const errorData = error.response?.data as any;
    const errorMessage = errorData?.message || 
                        errorData?.detail || 
                        errorData?.non_field_errors?.[0] ||
                        error.message || 
                        'An unexpected error occurred';

    throw new Error(errorMessage);
  }
);

export default apiClient;
