"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Cookie } from "lucide-react"
import Link from "next/link"

const COOKIE_CONSENT_KEY = "sw_cookie_consent"

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!consent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setShowBanner(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      accepted: true,
      timestamp: Date.now(),
      preferences: {
        necessary: true,
        performance: true,
        functional: true,
      }
    }))
    setShowBanner(false)
  }

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      accepted: false,
      timestamp: Date.now(),
      preferences: {
        necessary: true, // Always required
        performance: false,
        functional: false,
      }
    }))
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <Card className="mx-auto max-w-4xl border-2 shadow-lg">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <Cookie className="h-6 w-6 text-orange-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium">We use cookies to improve your experience</p>
                <p className="text-sm text-muted-foreground">
                  We use cookies to cache data locally for faster page loads and better performance.
                  By clicking &quot;Accept&quot;, you consent to our use of cookies.{" "}
                  <Link href="/cookies" className="text-orange-500 hover:underline">
                    Learn more
                  </Link>
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-shrink-0">
              <Button variant="outline" size="sm" onClick={handleDecline}>
                Decline
              </Button>
              <Button size="sm" onClick={handleAccept}>
                Accept All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Hook to check if user has consented to cookies
 */
export function useCookieConsent() {
  const [consent, setConsent] = useState<{
    accepted: boolean;
    preferences: {
      necessary: boolean;
      performance: boolean;
      functional: boolean;
    };
  } | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (stored) {
      setConsent(JSON.parse(stored))
    }
  }, [])

  return consent
}
