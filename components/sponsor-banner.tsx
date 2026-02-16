'use client'

import { useState, useEffect } from 'react'
import { X, Heart, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SponsorBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if banner was previously dismissed
    const isDismissed = localStorage.getItem('sponsor-banner-dismissed')
    if (!isDismissed) {
      setIsVisible(true)
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    // Remember dismissal for 7 days
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + 7)
    localStorage.setItem('sponsor-banner-dismissed', expiryDate.toISOString())
  }

  if (!isVisible) return null

  return (
    <div className="relative bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-white">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Zap className="h-5 w-5 flex-shrink-0 animate-pulse" />
            <p className="text-sm md:text-base font-medium">
              <span className="font-semibold">Experiencing slow performance?</span>
              {' '}We're currently on limited hosting due to funding constraints. Help us improve by sponsoring SpeakWise!
            </p>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="secondary"
              className="bg-white text-orange-600 hover:bg-orange-50 font-semibold gap-2"
              asChild
            >
              <a
                href="https://github.com/sponsors/your-username"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Heart className="h-4 w-4 fill-current" />
                <span className="hidden sm:inline">Sponsor Us</span>
                <span className="sm:hidden">Sponsor</span>
              </a>
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
              onClick={handleDismiss}
              aria-label="Dismiss banner"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
