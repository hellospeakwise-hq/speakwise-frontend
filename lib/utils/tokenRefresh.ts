import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

let tokenRefreshTimer: NodeJS.Timeout | null = null;

/**
 * Schedules automatic token refresh before expiration
 * For a 15-minute token, this refreshes at 12 minutes (3-minute buffer)
 */
export const scheduleTokenRefresh = () => {
  // Clear any existing timer
  if (tokenRefreshTimer) {
    clearTimeout(tokenRefreshTimer);
  }

  // Calculate refresh time (3 minutes before expiration)
  // For 15-min token: refresh at 12 minutes
  const TOKEN_LIFETIME_MS = 15 * 60 * 1000; // 15 minutes
  const REFRESH_BUFFER_MS = 3 * 60 * 1000;  // 3 minutes buffer
  const refreshInterval = TOKEN_LIFETIME_MS - REFRESH_BUFFER_MS; // 12 minutes

  console.log(`🔐 Token refresh scheduled in ${refreshInterval / 60000} minutes`);

  tokenRefreshTimer = setTimeout(async () => {
    if (typeof window === 'undefined') return;

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      console.warn('⚠️ No refresh token found, cannot refresh');
      return;
    }

    try {
      console.log('🔄 Proactively refreshing access token...');
      const response = await axios.post(`${API_BASE_URL}/api/auth/refresh/`, {
        refresh: refreshToken
      });

      const { access } = response.data;
      localStorage.setItem('accessToken', access);
      console.log('✅ Access token refreshed successfully');

      // Schedule next refresh
      scheduleTokenRefresh();
    } catch (error: any) {
      console.error('❌ Failed to refresh token:', error);
      
      // If refresh fails, clear tokens and redirect to login
      console.log('🚪 Logging out user due to refresh failure');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // Only redirect if we're in the browser
      if (typeof window !== 'undefined') {
        window.location.href = '/signin?session=expired';
      }
    }
  }, refreshInterval);
};

/**
 * Cancels any scheduled token refresh
 */
export const cancelTokenRefresh = () => {
  if (tokenRefreshTimer) {
    clearTimeout(tokenRefreshTimer);
    tokenRefreshTimer = null;
    console.log('🛑 Token refresh cancelled');
  }
};

/**
 * Starts token refresh if user is logged in
 */
export const initializeTokenRefresh = () => {
  if (typeof window === 'undefined') return;

  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    console.log('🚀 Initializing automatic token refresh');
    scheduleTokenRefresh();
  }
};
