import { apiClient } from './base';

// Types
export type UserRole = 'attendee' | 'speaker' | 'organizer' | 'admin';

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  nationality: string;
  username: string;
  userType: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  id: string;
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
  token?: string;
}

// Auth API service
export const authApi = {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const payload = {
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      role: {
        role: data.userType
      },
      nationality: data.nationality,
      username: data.username,
      password: data.password
    };

    console.log('Registration request:', { ...payload, password: '[HIDDEN]' });
    
    const response = await apiClient.post<AuthResponse>('/users/auth/register/', payload);
    return response.data;
  },

  /**
   * Login user
   */
  async login(data: LoginRequest, userType: UserRole): Promise<LoginResponse> {
    console.log(`Login request:`, { ...data, password: '[HIDDEN]' });
    
    const response = await apiClient.post<LoginResponse>(`/users/auth/login/`, data);

    // Store tokens if provided
    if (response.data.access_token || response.data.token) {
      const token = response.data.access_token || response.data.token;
      if (token && typeof window !== 'undefined') {
        localStorage.setItem('accessToken', token);
      }
      
      if (response.data.refresh_token && typeof window !== 'undefined') {
        localStorage.setItem('refreshToken', response.data.refresh_token);
      }
    }

    console.log('Login successful');
    return response.data;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout/');
    } catch (error) {
      console.error('Logout request failed:', error);
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
    const response = await apiClient.get<AuthResponse>('/auth/profile/');
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