"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { refreshTokenNow, expireSession } from "@/lib/utils/tokenRefresh"

const COUNTDOWN_SECONDS = 60

interface SessionExpiryDialogProps {
  open: boolean
  onStayLoggedIn: () => void
  onLoggedOut: () => void
}

export function SessionExpiryDialog({ open, onStayLoggedIn, onLoggedOut }: SessionExpiryDialogProps) {
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) {
      setCountdown(COUNTDOWN_SECONDS)
      return
    }

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          expireSession()
          onLoggedOut()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [open, onLoggedOut])

  const handleStayLoggedIn = async () => {
    setLoading(true)
    const success = await refreshTokenNow()
    setLoading(false)
    if (success) {
      onStayLoggedIn()
    } else {
      expireSession()
      onLoggedOut()
    }
  }

  const handleLogOut = () => {
    expireSession()
    onLoggedOut()
  }

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Are you still there?</DialogTitle>
          <DialogDescription>
            Your session is about to expire due to inactivity. You'll be logged out in{" "}
            <span className="font-semibold text-foreground">{countdown}</span> seconds.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleLogOut}>
            Log out
          </Button>
          <Button onClick={handleStayLoggedIn} disabled={loading}>
            {loading ? "Refreshing…" : "Stay logged in"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
