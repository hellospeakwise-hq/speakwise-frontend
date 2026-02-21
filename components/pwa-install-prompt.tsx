'use client'

import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Check if user previously dismissed
    const dismissed = sessionStorage.getItem('pwaPromptDismissed')
    if (dismissed) return

    const handler = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
      // Show after 3s delay so it doesn't pop immediately
      setTimeout(() => setIsVisible(true), 3000)
    }

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setIsInstalled(true))

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return
    await installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setIsInstalled(true)
    }
    setIsVisible(false)
    setInstallPrompt(null)
  }

  const handleDismiss = () => {
    setIsVisible(false)
    sessionStorage.setItem('pwaPromptDismissed', 'true')
  }

  if (!isVisible || isInstalled) return null

  return (
    <div
      className={`
        fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999]
        w-[calc(100%-2rem)] max-w-sm
        flex items-center gap-3 p-4
        rounded-2xl
        bg-white/10 dark:bg-black/30
        backdrop-blur-xl backdrop-saturate-150
        ring-1 ring-white/20 dark:ring-white/10
        shadow-2xl
        animate-in slide-in-from-bottom-4 fade-in
        duration-500
      `}
    >
      {/* App icon */}
      <div className="shrink-0 h-12 w-12 rounded-xl overflow-hidden ring-1 ring-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/icon-192x192.png" alt="SpeakWise" className="h-full w-full object-cover" />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground leading-tight">Install SpeakWise</p>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">
          Add to home screen for the best experience
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleInstall}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:opacity-90 active:scale-95 transition-all"
        >
          <Download className="h-3.5 w-3.5" />
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="rounded-full p-1.5 text-muted-foreground hover:bg-foreground/10 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
