import axios, { AxiosInstance, AxiosError } from 'axios';

// API configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000',
  TIMEOUT: 10000,
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

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle token expiration, but not for public endpoints
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      
      // Don't redirect for public endpoints that should be accessible without auth
      const publicEndpoints = ['/events/', '/events/1/', '/events/2/', '/events/3/', '/events/4/', '/events/5/'];
      const isPublicEndpoint = publicEndpoints.some(endpoint => url.includes(endpoint)) || 
                              url.match(/\/events\/\d+\/$/); // Match any event detail endpoint
      
      if (!isPublicEndpoint) {
        // Clear tokens and redirect to login only for protected endpoints
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/signin';
        }
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
