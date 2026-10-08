import { apiClient } from './base';
import { getApiErrorMessage } from '@/lib/utils/api-errors';

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

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ResendOtpRequest {
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SpeakerProfileData {
  id: string;
  slug?: string;
  [key: string]: any;
}

export interface OrganizationProfileData {
  id: string;
  status?: string;
  [key: string]: any;
}

export interface LoginProfiles {
  speaker_profile?: SpeakerProfileData;
  organization_profile?: OrganizationProfileData;
}

export interface AuthResponse {
  id: string;
  speaker_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  role?: {
    id: string;
    role: UserRole;
  };
  userType?: UserRole;
  nationality?: string;
  username?: string;
}

export interface LoginResponse extends AuthResponse {
  access_token?: string;
  refresh_token?: string;
  access?: string;
  refresh?: string;
  token?: string;
  profile?: LoginProfiles;
  profiles?: LoginProfiles;
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

    try {
      const response = await apiClient.post<AuthResponse>('users/auth/register/', payload);
      return response.data;
    } catch (error: any) {
      console.error('Registration error:', error.response?.data);
      throw new Error(
        getApiErrorMessage(error.response?.data, error.response?.status) ??
          error.message ??
          'We couldn’t create your account. Please try again.',
      );
    }
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
          const rawDetail = errorData.detail;
          const detailStr = typeof rawDetail === 'string'
            ? rawDetail
            : Array.isArray(rawDetail)
              ? rawDetail.join(' ')
              : String(rawDetail);
          const lowerDetail = detailStr.toLowerCase();
          if (lowerDetail.includes('invalid') || lowerDetail.includes('incorrect') || lowerDetail.includes('authentication') || lowerDetail.includes('credentials')) {
            throw new Error('Incorrect email or password');
          }
          throw new Error(detailStr);
        } else if (errorData?.message) {
          const msg = typeof errorData.message === 'string' ? errorData.message : JSON.stringify(errorData.message);
          throw new Error(msg);
        } else {
          const validationMessage = getApiErrorMessage(errorData);
          if (validationMessage) {
            throw new Error(validationMessage);
          }
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

  /**
   * Verify an email address using the OTP code sent during registration
   */
  async verifyOtp(data: VerifyOtpRequest): Promise<{ detail: string }> {
    try {
      const response = await apiClient.post<{ detail: string }>('users/auth/verify-otp/', data);
      return response.data;
    } catch (error: any) {
      const rawDetail = error.response?.data?.detail;
      const detail = typeof rawDetail === 'string'
        ? rawDetail
        : Array.isArray(rawDetail)
          ? rawDetail.join(' ')
          : error.response?.data?.otp?.[0] || 'Invalid or expired OTP code.';
      throw new Error(detail);
    }
  },

  /**
   * Request a fresh OTP code (respects the server-side resend cooldown)
   */
  async resendOtp(data: ResendOtpRequest): Promise<{ detail: string }> {
    try {
      const response = await apiClient.post<{ detail: string }>('users/auth/resend-otp/', data);
      return response.data;
    } catch (error: any) {
      const rawDetail = error.response?.data?.detail;
      const detail = typeof rawDetail === 'string'
        ? rawDetail
        : Array.isArray(rawDetail)
          ? rawDetail.join(' ')
          : 'Failed to resend code. Please try again.';
      throw new Error(detail);
    }
  },

  /**
   * Exchange OAuth one-time code for access tokens and user data
   * NEW: Required for OAuth flow after backend authentication hardening
   */
  async exchangeOAuthCode(code: string): Promise<LoginResponse> {
    console.log('Exchanging OAuth code for tokens');

    try {
      const response = await apiClient.post<LoginResponse>('users/auth/oauth/token/', { code });

      // Store tokens
      const accessToken = response.data.access || response.data.access_token;
      const refreshToken = response.data.refresh || response.data.refresh_token;

      if (accessToken && typeof window !== 'undefined') {
        localStorage.setItem('accessToken', accessToken);
      }

      if (refreshToken && typeof window !== 'undefined') {
        localStorage.setItem('refreshToken', refreshToken);
      }

      console.log('OAuth token exchange successful');
      return response.data;
    } catch (error: any) {
      console.error('OAuth token exchange failed:', error.response?.data);
      const rawDetail = error.response?.data?.detail;
      const detail = typeof rawDetail === 'string'
        ? rawDetail
        : Array.isArray(rawDetail)
          ? rawDetail.join(' ')
          : 'Failed to complete OAuth authentication';
      throw new Error(detail);
    }
  },
};

export default authApi;