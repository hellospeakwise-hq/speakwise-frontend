"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Icons } from "@/components/icons"
import { toast } from "sonner"
import { authApi } from "@/lib/api/auth"

function OAuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser } = useAuth()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [isNewUser, setIsNewUser] = useState(false)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        
        // Get tokens and user data from URL params - support both formats (access_token/access and refresh_token/refresh)
        const accessToken = searchParams.get('access_token') || searchParams.get('access')
        const refreshToken = searchParams.get('refresh_token') || searchParams.get('refresh')
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')
        
        // Check if this is a new user (first OAuth login)
        const newUser = searchParams.get('is_new_user') === 'true'
        setIsNewUser(newUser)
        
        // Get user data from URL params (backend may pass these)
        const userId = searchParams.get('user_id')
        const email = searchParams.get('email')
        const firstName = searchParams.get('first_name')
        const lastName = searchParams.get('last_name')
        const username = searchParams.get('username')
        const speakerId = searchParams.get('speaker_id')
        const roleId = searchParams.get('role_id')
        const roleName = searchParams.get('role')

        console.log('=== OAuth Callback ===')
        console.log('Access Token:', accessToken ? 'received' : 'missing')
        console.log('Is New User:', isNewUser)
        console.log('User Data:', { userId, email, firstName, lastName, username })
        console.log('=======================')
        
        if (error) {
          setStatus('error')
          setErrorMessage(errorDescription || error)
          toast.error(`OAuth error: ${errorDescription || error}`)
          setTimeout(() => router.push('/signin'), 3000)
          return
        }

        if (!accessToken) {
          setStatus('error')
          setErrorMessage('No access token received')
          toast.error('Authentication failed: No access token received')
          setTimeout(() => router.push('/signin'), 3000)
          return
        }

        // Store tokens
        localStorage.setItem('accessToken', accessToken)
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken)
        }

        // Try to get user profile from API
        let userData = null
        try {
          const profile = await authApi.getProfile()
          userData = {
            id: profile.id,
            speaker_id: profile.speaker_id,
            first_name: profile.first_name,
            last_name: profile.last_name,
            email: profile.email,
            role: profile.role || { id: 2, role: 'speaker' },
            userType: profile.role?.role || 'speaker'
          }
        } catch (profileError) {
          console.log('Could not fetch profile, using URL params')
          // Fallback to URL params if profile fetch fails
          if (userId && email) {
            userData = {
              id: userId,
              speaker_id: speakerId ? parseInt(speakerId) : undefined,
              first_name: firstName || '',
              last_name: lastName || '',
              email: email,
              role: { id: roleId ? parseInt(roleId) : 2, role: (roleName as any) || 'speaker' },
              userType: (roleName as any) || 'speaker'
            }
          }
        }

        if (userData) {
          // Store user data
          localStorage.setItem('user', JSON.stringify(userData))
          setUser(userData)
        }

        setStatus('success')
        toast.success('Successfully signed in!')

        // Always redirect to profile page after OAuth login
        const redirectPath = '/profile'
        
        sessionStorage.removeItem('oauthRedirect')
        
        console.log('Redirecting to:', redirectPath)

        // Redirect after a brief delay
        setTimeout(() => router.push(redirectPath), 1000)
      } catch (error: any) {
        console.error('OAuth callback error:', error)
        setStatus('error')
        setErrorMessage(error.message || 'An error occurred during authentication')
        toast.error('Authentication failed')
        setTimeout(() => router.push('/signin'), 3000)
      }
    }

    handleCallback()
  }, [searchParams, router, setUser])

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-4 text-center">
          {status === 'loading' && (
            <>
              <Icons.spinner className="mx-auto h-12 w-12 animate-spin" />
              <h1 className="text-2xl font-semibold tracking-tight">
                Completing sign in...
              </h1>
              <p className="text-sm text-muted-foreground">
                Please wait while we authenticate your account
              </p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <Icons.check className="mx-auto h-12 w-12 text-green-600" />
              <h1 className="text-2xl font-semibold tracking-tight">
                Success!
              </h1>
              <p className="text-sm text-muted-foreground">
                Taking you to your profile...
              </p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <Icons.alertCircle className="mx-auto h-12 w-12 text-red-600" />
              <h1 className="text-2xl font-semibold tracking-tight">
                Authentication Failed
              </h1>
              <p className="text-sm text-muted-foreground">
                {errorMessage}
              </p>
              <p className="text-xs text-muted-foreground">
                Redirecting back to sign in...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="container flex h-screen w-screen flex-col items-center justify-center">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-4 text-center">
              <Icons.spinner className="mx-auto h-12 w-12 animate-spin" />
              <h1 className="text-2xl font-semibold tracking-tight">
                Loading...
              </h1>
            </div>
          </div>
        </div>
      }
    >
      <OAuthCallbackContent />
    </Suspense>
  )
}
