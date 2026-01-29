// OAuth utility functions for handling OAuth flows
export const OAUTH_PROVIDERS = {
  GITHUB: 'github',
  GOOGLE: 'google',
} as const

export type OAuthProvider = typeof OAUTH_PROVIDERS[keyof typeof OAUTH_PROVIDERS]

/**
 * Generate a random state parameter for OAuth security
 */
function generateRandomState(): string {
  const array = new Uint8Array(32)
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array)
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Get the OAuth authorization URL for a provider
 */
export function getOAuthUrl(provider: OAuthProvider, state?: string): string {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  const redirectUrl = `${backendUrl}/api/users/auth/${provider}-callback/`
  
  switch (provider) {
    case OAUTH_PROVIDERS.GITHUB:
      const githubClientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || 'Ov23li46A8l3kmPU0ncS'
      // Don't include state - let backend handle validation
      return `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${encodeURIComponent(redirectUrl)}&scope=user:email`
    
    case OAUTH_PROVIDERS.GOOGLE:
      const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '731372296056-ejqnrtgss8pt2e9gtrrn4soi2uo7dp0c.apps.googleusercontent.com'
      // Don't include state - let backend handle validation
      return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(redirectUrl)}&response_type=code&scope=openid%20email%20profile`
    
    default:
      throw new Error(`Unknown OAuth provider: ${provider}`)
  }
}

/**
 * Initiate OAuth login flow - Let backend handle state generation
 */
export function initiateOAuthLogin(provider: OAuthProvider) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  
  // Store where to redirect after login
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('oauthRedirect', window.location.pathname)
  }
  
  // Redirect to backend - it will generate state and redirect to GitHub/Google
  const initiateUrl = `${backendUrl}/api/users/auth/${provider}-login/`
  
  console.log('=== Frontend OAuth Initiate ===')
  console.log('Provider:', provider)
  console.log('Redirecting to backend:', initiateUrl)
  console.log('================================')
  
  window.location.href = initiateUrl
}

/**
 * Verify state parameter
 */
export function verifyOAuthState(returnedState: string): boolean {
  if (typeof window === 'undefined') return false
  
  const storedState = sessionStorage.getItem('oauthState')
  const isValid = storedState === returnedState
  
  // Clear state after verification
  sessionStorage.removeItem('oauthState')
  
  return isValid
}

/**
 * Handle OAuth callback - extract tokens and user data
 */
export function handleOAuthCallback(searchParams: URLSearchParams) {
  const accessToken = searchParams.get('access_token')
  const refreshToken = searchParams.get('refresh_token')
  const error = searchParams.get('error')
  const state = searchParams.get('state')
  
  if (error) {
    throw new Error(error)
  }
  
  if (accessToken && typeof window !== 'undefined') {
    localStorage.setItem('accessToken', accessToken)
  }
  
  if (refreshToken && typeof window !== 'undefined') {
    localStorage.setItem('refreshToken', refreshToken)
  }
  
  // Get stored redirect path
  const redirectPath = typeof window !== 'undefined' 
    ? sessionStorage.getItem('oauthRedirect') || '/dashboard'
    : '/dashboard'
  
  // Clear stored redirect
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('oauthRedirect')
  }
  
  return {
    accessToken,
    refreshToken,
    redirectPath,
  }
}
