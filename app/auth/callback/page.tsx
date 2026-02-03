"use client"

import { useEffect, useState, Suspense, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Icons } from "@/components/icons"
import { toast } from "sonner"

function OAuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [isNewUser, setIsNewUser] = useState(false)
  const hasRun = useRef(false)

  useEffect(() => {
    // Prevent double execution
    if (hasRun.current) return
    hasRun.current = true

    const handleCallback = async () => {
      try {
        // Get tokens from URL - support both formats
        const accessToken = searchParams.get('access_token') || searchParams.get('access')
        const refreshToken = searchParams.get('refresh_token') || searchParams.get('refresh')
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')
        
        // Get user data from URL (backend passes this in the 'user' param)
        const userParam = searchParams.get('user')

        console.log('=== OAuth Callback ===')
        console.log('Access Token:', accessToken ? 'received' : 'missing')
        console.log('User param:', userParam ? 'received' : 'missing')

        if (error) {
          setStatus('error')
          setErrorMessage(errorDescription || error)
          toast.error(`OAuth error: ${errorDescription || error}`)
          setTimeout(() => router.replace('/signin'), 2000)
          return
        }

        if (!accessToken) {
          setStatus('error')
          setErrorMessage('No access token received')
          toast.error('Authentication failed: No access token received')
          setTimeout(() => router.replace('/signin'), 2000)
          return
        }

        // Store tokens in localStorage
        localStorage.setItem('accessToken', accessToken)
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken)
        }

        // Parse user data from URL param
        let userData = null
        if (userParam) {
          try {
            // Backend sends Python dict format, need to parse it
            const cleanedUserParam = userParam
              .replace(/'/g, '"')
              .replace(/None/g, 'null')
              .replace(/True/g, 'true')
              .replace(/False/g, 'false')
            const parsedUser = JSON.parse(cleanedUserParam)
            
            userData = {
              id: parsedUser.id,
              first_name: parsedUser.first_name || '',
              last_name: parsedUser.last_name || '',
              email: parsedUser.email,
              role: { id: 2, role: 'speaker' },
              userType: 'speaker'
            }
          } catch (e) {
            console.log('Could not parse user param:', e)
          }
        }

        // If we have user data, store it
        if (userData) {
          localStorage.setItem('user', JSON.stringify(userData))
          console.log('User data stored:', userData)
        }

        // Check if profile is incomplete (new user)
        const profileIncomplete = !userData?.first_name || userData.first_name === ''
        setIsNewUser(profileIncomplete)

        setStatus('success')

        // Determine redirect
        let redirectPath = '/'
        if (profileIncomplete) {
          redirectPath = '/profile'
          toast.success('Hey new Speaker! 🎤 Complete your profile to get started!', { duration: 5000 })
        } else {
          toast.success('Welcome back! 👋')
        }

        console.log('Redirecting to:', redirectPath)
        
        // Use replace to avoid back-button issues
        setTimeout(() => {
          window.location.href = redirectPath
        }, 1000)

      } catch (error: any) {
        console.error('OAuth callback error:', error)
        setStatus('error')
        setErrorMessage(error.message || 'An error occurred')
        toast.error('Authentication failed')
        setTimeout(() => router.replace('/signin'), 2000)
      }
    }

    handleCallback()
  }, [searchParams, router])

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
                {isNewUser ? 'Welcome to SpeakWise! 🎉' : 'Welcome back!'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isNewUser 
                  ? 'Taking you to complete your profile...' 
                  : 'Taking you home...'}
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