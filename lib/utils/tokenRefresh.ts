import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

const TOKEN_LIFETIME_MS = 15 * 60 * 1000  // 15 minutes
const WARNING_BEFORE_MS = 2 * 60 * 1000   // warn 2 min before expiry (at 13 min)
const WARNING_AT_MS = TOKEN_LIFETIME_MS - WARNING_BEFORE_MS

let tokenRefreshTimer: NodeJS.Timeout | null = null
let sessionWarningCallback: (() => void) | null = null
let sessionExpireCallback: (() => void) | null = null

export const setSessionCallbacks = (
  onWarning: () => void,
  onExpire: () => void
) => {
  sessionWarningCallback = onWarning
  sessionExpireCallback = onExpire
}

export const scheduleTokenRefresh = () => {
  if (tokenRefreshTimer) clearTimeout(tokenRefreshTimer)

  // At 13 minutes: show warning dialog
  tokenRefreshTimer = setTimeout(() => {
    if (typeof window === 'undefined') return
    if (sessionWarningCallback) sessionWarningCallback()
  }, WARNING_AT_MS)
}

// Called when user clicks "Stay logged in" in the warning dialog
export const refreshTokenNow = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false

  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) return false

  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/refresh/`, {
      refresh: refreshToken
    })
    const { access } = response.data
    localStorage.setItem('accessToken', access)
    scheduleTokenRefresh()
    return true
  } catch {
    return false
  }
}

// Called when countdown runs out or user clicks "Log out"
export const expireSession = () => {
  cancelTokenRefresh()
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
  if (sessionExpireCallback) sessionExpireCallback()
}

export const cancelTokenRefresh = () => {
  if (tokenRefreshTimer) {
    clearTimeout(tokenRefreshTimer)
    tokenRefreshTimer = null
  }
}

export const initializeTokenRefresh = () => {
  if (typeof window === 'undefined') return
  const accessToken = localStorage.getItem('accessToken')
  if (accessToken) scheduleTokenRefresh()
}
