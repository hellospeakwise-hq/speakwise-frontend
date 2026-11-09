import axios from 'axios';

// Sanitize the API Base URL to prevent any trailing slashes, spaces, or accidental inline comments
function getCleanApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  return raw.trim().replace(/\/+$/, '').split(/\s+#/)[0].trim();
}

// Background silent refresh interval (every 12 minutes to stay safely ahead of JWT lifetime)
const SILENT_REFRESH_INTERVAL_MS = 12 * 60 * 1000;

let silentRefreshTimer: NodeJS.Timeout | null = null;
let sessionExpireCallback: (() => void) | null = null;

export const setSessionCallbacks = (
  _onWarning: () => void,
  onExpire: () => void
) => {
  sessionExpireCallback = onExpire;
};

// Silently refreshes token in background while user is active
export const scheduleTokenRefresh = () => {
  if (silentRefreshTimer) clearTimeout(silentRefreshTimer);

  silentRefreshTimer = setTimeout(async () => {
    if (typeof window === 'undefined') return;
    const ok = await refreshTokenNow();
    if (ok) {
      scheduleTokenRefresh();
    }
  }, SILENT_REFRESH_INTERVAL_MS);
};

// Called when user clicks "Stay logged in" or during silent background refresh
export const refreshTokenNow = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;

  const refreshToken =
    localStorage.getItem('refreshToken') ||
    localStorage.getItem('refresh_token');

  if (!refreshToken) {
    console.warn('[tokenRefresh] No refresh token found');
    return false;
  }

  try {
    const baseUrl = getCleanApiBaseUrl();
    const response = await axios.post(`${baseUrl}/api/auth/refresh/`, {
      refresh: refreshToken,
    });

    const access = response.data?.access || response.data?.access_token;
    if (!access) return false;

    localStorage.setItem('accessToken', access);
    localStorage.setItem('access_token', access);

    if (response.data?.refresh) {
      localStorage.setItem('refreshToken', response.data.refresh);
      localStorage.setItem('refresh_token', response.data.refresh);
    }

    scheduleTokenRefresh();
    return true;
  } catch (error) {
    console.error('[tokenRefresh] Failed to refresh token:', error);
    return false;
  }
};

export const expireSession = () => {
  cancelTokenRefresh();
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }
  if (sessionExpireCallback) sessionExpireCallback();
};

export const cancelTokenRefresh = () => {
  if (silentRefreshTimer) {
    clearTimeout(silentRefreshTimer);
    silentRefreshTimer = null;
  }
};

export const initializeTokenRefresh = () => {
  if (typeof window === 'undefined') return;
  const token = localStorage.getItem('accessToken') || localStorage.getItem('access_token');
  if (token) scheduleTokenRefresh();
};
