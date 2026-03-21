"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Clock, LogOut, MousePointerClick } from "lucide-react"

const IDLE_TIMEOUT_MS = 10 * 60 * 1000   // 10 minutes of inactivity
const COUNTDOWN_SECONDS = 60              // 60-second countdown before logout

export function IdleTimeoutModal() {
  const { isAuthenticated, logout } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)

  const idleTimerRef = useRef<NodeJS.Timeout | null>(null)
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Reset the idle timer on user activity
  const resetIdleTimer = useCallback(() => {
    // If modal is showing, don't reset (user must click the button)
    if (showModal) return

    // Clear existing timer
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current)
    }

    // Start new idle timer
    idleTimerRef.current = setTimeout(() => {
      setShowModal(true)
      setCountdown(COUNTDOWN_SECONDS)
    }, IDLE_TIMEOUT_MS)
  }, [showModal])

  // Handle "I'm still here" click
  const handleStayLoggedIn = useCallback(() => {
    // Stop the countdown
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current)
      countdownTimerRef.current = null
    }

    setShowModal(false)
    setCountdown(COUNTDOWN_SECONDS)
    resetIdleTimer()
  }, [resetIdleTimer])

  // Handle logout (manual or countdown expired)
  const handleLogout = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current)
      countdownTimerRef.current = null
    }
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current)
      idleTimerRef.current = null
    }

    setShowModal(false)
    logout()
  }, [logout])

  // Start countdown when modal shows
  useEffect(() => {
    if (!showModal) return

    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Time's up — log out
          handleLogout()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current)
      }
    }
  }, [showModal, handleLogout])

  // Set up activity listeners
  useEffect(() => {
    if (!isAuthenticated) return

    const activityEvents = [
      "mousedown", "mousemove", "keydown",
      "scroll", "touchstart", "click"
    ]

    const handleActivity = () => resetIdleTimer()

    // Start idle timer
    resetIdleTimer()

    // Listen for activity
    activityEvents.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true })
    })

    return () => {
      activityEvents.forEach((event) => {
        document.removeEventListener(event, handleActivity)
      })
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current)
    }
  }, [isAuthenticated, resetIdleTimer])

  // Don't render anything if not authenticated or modal not showing
  if (!isAuthenticated || !showModal) return null

  // Calculate progress for the circular countdown
  const progress = (countdown / COUNTDOWN_SECONDS) * 100
  const circumference = 2 * Math.PI * 44 // radius = 44

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" />

      {/* Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 p-8 shadow-2xl shadow-black/40 animate-in zoom-in-95 fade-in duration-200">

          {/* Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Countdown circle */}
          <div className="relative flex justify-center mb-6">
            <div className="relative w-24 h-24">
              {/* Background circle */}
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                <circle
                  cx="48" cy="48" r="44"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-white/10"
                />
                <circle
                  cx="48" cy="48" r="44"
                  fill="none"
                  stroke="url(#countdown-gradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - (progress / 100) * circumference}
                  className="transition-all duration-1000 ease-linear"
                />
                <defs>
                  <linearGradient id="countdown-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Countdown number */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-2xl font-bold tabular-nums ${
                  countdown <= 10 ? 'text-red-400' : 'text-white'
                }`}>
                  {countdown}
                </span>
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold text-white mb-2">
              Are you still there?
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              You&apos;ve been inactive for a while. For your security, you&apos;ll be logged out in{" "}
              <span className={`font-semibold ${countdown <= 10 ? 'text-red-400' : 'text-orange-400'}`}>
                {countdown} seconds
              </span>.
            </p>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleStayLoggedIn}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-3 px-6 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <MousePointerClick className="h-4 w-4" />
              Yes, I&apos;m still here
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 py-3 px-6 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              <LogOut className="h-4 w-4" />
              Log out now
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
