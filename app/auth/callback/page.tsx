"use client"

import { useEffect, useState, Suspense, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Icons } from "@/components/icons"
import { toast } from "sonner"
import { authApi } from "@/lib/api/auth"

function OAuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const hasRun = useRef(false)

  useEffect(() => {
    // Prevent double execution
    if (hasRun.current) return
    hasRun.current = true

    const handleCallback = async () => {
      try {
        // NEW FLOW: Get one-time code from URL (not tokens)
        const code = searchParams.get('code')
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')

        console.log('=== OAuth Callback (New Flow) ===')
        console.log('Code:', code ? 'received' : 'missing')

        if (error) {
          setStatus('error')
          setErrorMessage(errorDescription || error)
          toast.error(`OAuth error: ${errorDescription || error}`)
          setTimeout(() => router.replace('/signin'), 2000)
          return
        }

        if (!code) {
          setStatus('error')
          setErrorMessage('No authorization code received')
          toast.error('Authentication failed: No authorization code received')
          setTimeout(() => router.replace('/signin'), 2000)
          return
        }

        // Exchange code for tokens and user data
        const response = await authApi.exchangeOAuthCode(code)

        // Extract user and profile data from response
        const userData = {
          id: response.id,
          first_name: response.first_name || '',
          last_name: response.last_name || '',
          email: response.email,
          role: response.role || { id: '2', role: 'speaker' },
          userType: response.role?.role || 'speaker'
        }

        // Store user data
        localStorage.setItem('user', JSON.stringify(userData))
        console.log('User data stored:', userData)

        // Handle profile type from new response structure
        const profiles = response.profiles || {}
        const hasSpeakerProfile = !!profiles.speaker_profile
        const hasOrgProfile = !!profiles.organization_profile

        if (hasSpeakerProfile) {
          localStorage.setItem('profile_type', 'speaker')
          if (profiles.speaker_profile?.slug) {
            const stored = JSON.parse(localStorage.getItem('user') || '{}')
            localStorage.setItem('user', JSON.stringify({ ...stored, speaker_slug: profiles.speaker_profile.slug }))
          }
        } else if (hasOrgProfile) {
          localStorage.setItem('profile_type', 'organization')
          localStorage.setItem('cached_org_profile', JSON.stringify(profiles.organization_profile))
        }

        setStatus('success')

        // Determine redirect based on profile existence
        let redirectPath = '/'
        if (!hasSpeakerProfile && !hasOrgProfile) {
          // New user - show profile type modal
          sessionStorage.setItem('showProfileTypeModal', 'true')
          redirectPath = '/'
          toast.success('Welcome to SpeakWise! 🎉', { duration: 3000 })
        } else if (hasSpeakerProfile) {
          redirectPath = '/dashboard/speaker'
          toast.success('Welcome back! 👋')
        } else if (hasOrgProfile) {
          redirectPath = '/dashboard/organizer'
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
        setErrorMessage(error.message || 'An error occurred during authentication')
        toast.error(error.message || 'Authentication failed')
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
                Welcome to SpeakWise! 🎉
              </h1>
              <p className="text-sm text-muted-foreground">
                Taking you to your dashboard...
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