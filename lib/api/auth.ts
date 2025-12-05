import { apiClient } from './base';

// Types
export type UserRole = 'attendee' | 'speaker' | 'organizer' | 'admin';

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  nationality: string;
  username: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  id: string;
  speaker_id?: number;
  first_name: string;
  last_name: string;
  email: string;
  role: {
    id: number;
    role: UserRole;
  };
  nationality: string;
  username: string;
}

export interface LoginResponse extends AuthResponse {
  access_token?: string;
  refresh_token?: string;
  access?: string;  // New token format from backend
  refresh?: string; // New token format from backend
  token?: string;   // Legacy token support
}

// Auth API service
export const authApi = {
  /**
   * Register a new user (defaults to speaker role)
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const payload = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      nationality: data.nationality,
      username: data.username,
      password: data.password
    };

    console.log('Registration request:', { ...payload, password: '[HIDDEN]' });

    const response = await apiClient.post<AuthResponse>('users/auth/register/', payload);
    return response.data;
  },

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    console.log(`Login request:`, { ...data, password: '[HIDDEN]' });

    try {
      const response = await apiClient.post<LoginResponse>(`users/auth/login/`, data);

      // Store tokens if provided - handle both old and new token formats
      const accessToken = response.data.access_token || response.data.access || response.data.token;
      const refreshToken = response.data.refresh_token || response.data.refresh;

      if (accessToken && typeof window !== 'undefined') {
        localStorage.setItem('accessToken', accessToken);
      }

      if (refreshToken && typeof window !== 'undefined') {
        localStorage.setItem('refreshToken', refreshToken);
      }

      console.log('Login successful');
      return response.data;
    } catch (error: any) {
      console.log('Auth error details:', error.response?.data);

      // Handle authentication-specific errors
      if (error.response?.status === 400 || error.response?.status === 401) {
        const errorData = error.response?.data;

        // Check for various error message formats from the backend
        if (errorData?.non_field_errors && Array.isArray(errorData.non_field_errors)) {
          // Backend returns non_field_errors as an array
          throw new Error('Incorrect email or password');
        } else if (errorData?.detail) {
          // If detail contains authentication-related keywords, provide friendly message
          const detail = errorData.detail.toLowerCase();
          if (detail.includes('invalid') || detail.includes('incorrect') || detail.includes('authentication') || detail.includes('credentials')) {
            throw new Error('Incorrect email or password');
          }
          throw new Error(errorData.detail);
        } else if (errorData?.message) {
          throw new Error(errorData.message);
        } else {
          // Generic auth error message for 400/401 status codes
          throw new Error('Incorrect email or password');
        }
      }

      // Re-throw other errors as-is
      throw error;
    }
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;

      if (refreshToken) {
        console.log('Sending logout request with refresh token');
        // Send refresh token to backend for proper logout
        // Try different possible field names that the backend might expect
        await apiClient.post('/users/auth/logout/', {
          refresh_token: refreshToken,
          refresh: refreshToken  // Also try this format in case backend expects 'refresh'
        });
        console.log('Logout request successful');
      } else {
        console.warn('No refresh token found for logout');
      }
    } catch (error: any) {
      console.error('Logout request failed:', error);
      console.error('Logout error response:', error?.response?.data);
      console.error('Logout error status:', error?.response?.status);

      // Log the refresh token being sent for debugging
      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
      console.log('Refresh token being sent:', refreshToken ? 'Token exists' : 'No token');

      // Continue with local cleanup even if server request fails
    } finally {
      // Always clear local storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    }
  },

  /**
   * Get user profile
   */
  async getProfile(): Promise<AuthResponse> {
    const response = await apiClient.get<AuthResponse>('/users/me/');
    return response.data;
  },

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<{ access_token: string }> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<{ access_token: string }>(
      '/auth/refresh/',
      { refresh_token: refreshToken }
    );

    // Update stored token
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', response.data.access_token);
    }

    return response.data;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;

    const token = localStorage.getItem('accessToken');
    return !!token;
  },

  /**
   * Get stored auth token
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null;

    return localStorage.getItem('accessToken');
  },
};

export default authApi;