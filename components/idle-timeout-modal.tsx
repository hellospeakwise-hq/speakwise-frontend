"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { LogOut, ArrowRight, Loader2 } from "lucide-react"
import { refreshTokenNow } from "@/lib/utils/tokenRefresh"

const IDLE_TIMEOUT_MS = 15 * 60 * 1000   // 15 minutes of inactivity
const COUNTDOWN_SECONDS = 60              // 60-second countdown before logout

export function IdleTimeoutModal() {
  const { isAuthenticated, logout } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const idleTimerRef = useRef<NodeJS.Timeout | null>(null)
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Reset the idle timer on user activity
  const resetIdleTimer = useCallback(() => {
    // If modal is showing, don't reset until user confirms
    if (showModal) return

    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current)
    }

    idleTimerRef.current = setTimeout(() => {
      setShowModal(true)
      setCountdown(COUNTDOWN_SECONDS)
    }, IDLE_TIMEOUT_MS)
  }, [showModal])

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

  // Handle "Continue Session" click
  const handleStayLoggedIn = useCallback(async () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current)
      countdownTimerRef.current = null
    }

    setIsRefreshing(true)
    try {
      const refreshed = await refreshTokenNow()

      if (!refreshed) {
        // Refresh failed — token is invalid, log the user out cleanly
        setIsRefreshing(false)
        handleLogout()
        return
      }

      // Success — hide modal and restart the idle timer
      setIsRefreshing(false)
      setShowModal(false)
      setCountdown(COUNTDOWN_SECONDS)

      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      idleTimerRef.current = setTimeout(() => {
        setShowModal(true)
        setCountdown(COUNTDOWN_SECONDS)
      }, IDLE_TIMEOUT_MS)
    } catch {
      // Unexpected error — also log out
      setIsRefreshing(false)
      handleLogout()
    }
  }, [handleLogout])

  // Start countdown when modal shows
  useEffect(() => {
    if (!showModal) return

    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
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

    resetIdleTimer()

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

  if (!isAuthenticated || !showModal) return null

  const progress = (countdown / COUNTDOWN_SECONDS) * 100
  const circumference = 2 * Math.PI * 40 // radius = 40

  return (
    <>
      {/* Dim backdrop */}
      <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" />

      {/* Modal Dialog */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div className="relative w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl text-slate-100 animate-in zoom-in-95 fade-in duration-200">
          {/* Circular Countdown Progress */}
          <div className="flex justify-center mb-5">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 96 96">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-slate-800"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  fill="none"
                  stroke={countdown <= 10 ? "#ef4444" : "#f97316"}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - (progress / 100) * circumference}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>

              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-xl font-bold tabular-nums ${countdown <= 10 ? 'text-red-400' : 'text-slate-100'}`}>
                  {countdown}s
                </span>
              </div>
            </div>
          </div>

          {/* Heading & Notice */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-white mb-1.5">
              Are you still there?
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              You have been inactive for a while. For your account security, this session will automatically close in{" "}
              <span className={`font-semibold ${countdown <= 10 ? 'text-red-400' : 'text-slate-200'}`}>
                {countdown} seconds
              </span>.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={handleStayLoggedIn}
              disabled={isRefreshing}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white py-2.5 px-4 text-xs sm:text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {isRefreshing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Refreshing session…</span>
                </>
              ) : (
                <>
                  <span>Continue Session</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <button
              onClick={handleLogout}
              disabled={isRefreshing}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white py-2.5 px-4 text-xs font-medium border border-slate-700/60 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
