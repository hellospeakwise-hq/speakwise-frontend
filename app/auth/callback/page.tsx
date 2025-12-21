"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Icons } from "@/components/icons"
import { toast } from "sonner"

function OAuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser } = useAuth()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        
        // Get tokens from URL params
        const accessToken = searchParams.get('access_token')
        const refreshToken = searchParams.get('refresh_token')
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')

        
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

        // Get user data from token or make API call to get profile
        // For now, we'll redirect to dashboard and let the auth context handle it
        setStatus('success')
        toast.success('Successfully signed in!')

        // Get stored redirect path or default to dashboard
        const redirectPath = sessionStorage.getItem('oauthRedirect') || '/dashboard'
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
                Redirecting you to your dashboard...
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
