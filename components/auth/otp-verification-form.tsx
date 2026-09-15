"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"

interface OtpVerificationFormProps {
  email: string
  /** Called when the user wants to go back and change their email / re-register */
  onBack?: () => void
}

const OTP_LENGTH = 6
/** Must match the backend OTP_RESEND_COOLDOWN_MINUTES setting (currently 2 min = 120s) */
const RESEND_COOLDOWN = 120

export function OtpVerificationForm({ email, onBack }: OtpVerificationFormProps) {
  const router = useRouter()
  const { verifyOtp, resendOtp } = useAuth()

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""))
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN)
  const [error, setError] = useState("")

  const inputRefs = useRef<Array<HTMLInputElement | null>>(Array(OTP_LENGTH).fill(null))

  // Start the cooldown countdown immediately
  useEffect(() => {
    if (countdown <= 0) return
    const id = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000)
    return () => clearInterval(id)
  }, [countdown])

  // Auto-focus the first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const focusAt = (index: number) => {
    const target = Math.max(0, Math.min(OTP_LENGTH - 1, index))
    inputRefs.current[target]?.focus()
  }

  const handleChange = (index: number, value: string) => {
    // Allow only digits
    const digit = value.replace(/\D/g, "").slice(-1)
    const next = [...digits]
    next[index] = digit
    setDigits(next)
    setError("")

    if (digit && index < OTP_LENGTH - 1) {
      focusAt(index + 1)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const next = [...digits]
        next[index] = ""
        setDigits(next)
      } else {
        focusAt(index - 1)
      }
    } else if (e.key === "ArrowLeft") {
      focusAt(index - 1)
    } else if (e.key === "ArrowRight") {
      focusAt(index + 1)
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH)
    if (!pasted) return

    const next = [...digits]
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i]
    }
    setDigits(next)
    setError("")
    // Focus the input after the last pasted digit
    focusAt(Math.min(pasted.length, OTP_LENGTH - 1))
  }

  const otp = digits.join("")
  const isComplete = otp.length === OTP_LENGTH

  const handleVerify = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault()
      if (!isComplete || isVerifying) return
      setError("")
      setIsVerifying(true)

      try {
        toast.loading("Verifying your email…", { id: "otp" })
        await verifyOtp(email, otp)

        toast.success("✅ Email verified! You can now sign in.", {
          id: "otp",
          duration: 3000,
        })

        // Flag for the profile-type modal on first login
        sessionStorage.setItem("showProfileTypeModal", "true")

        setTimeout(() => {
          router.push("/signin")
        }, 1200)
      } catch (err: any) {
        const message = err.message || "Invalid or expired OTP code."
        setError(message)
        toast.error(`❌ ${message}`, { id: "otp", duration: 5000 })
        // Clear digits on error so user can retype
        setDigits(Array(OTP_LENGTH).fill(""))
        focusAt(0)
      } finally {
        setIsVerifying(false)
      }
    },
    [email, otp, isComplete, isVerifying, verifyOtp, router]
  )

  // Auto-submit when all digits are filled
  useEffect(() => {
    if (isComplete && !isVerifying) {
      handleVerify()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete])

  const handleResend = async () => {
    if (countdown > 0 || isResending) return
    setIsResending(true)
    setError("")

    try {
      toast.loading("Sending a new code…", { id: "resend" })
      await resendOtp(email)
      toast.success("📬 A new code has been sent to your email.", {
        id: "resend",
        duration: 4000,
      })
      setDigits(Array(OTP_LENGTH).fill(""))
      setCountdown(RESEND_COOLDOWN)
      focusAt(0)
    } catch (err: any) {
      const message = err.message || "Failed to resend code."
      toast.error(`❌ ${message}`, { id: "resend", duration: 5000 })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="grid gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1 text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Icons.mail className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight">Check your email</h2>
        <p className="text-sm text-muted-foreground">
          We sent a {OTP_LENGTH}-digit code to
        </p>
        <p className="text-sm font-medium">{email}</p>
      </div>

      {/* OTP digit grid */}
      <form onSubmit={handleVerify} className="grid gap-4">
        <div
          className="flex justify-center gap-2"
          onPaste={handlePaste}
          aria-label="One-time password input"
        >
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el
              }}
              id={`otp-digit-${i}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={isVerifying}
              className={cn(
                "h-12 w-10 rounded-md border bg-background text-center text-lg font-semibold",
                "ring-offset-background transition-all",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50",
                digit && "border-primary",
                error && "border-destructive"
              )}
              aria-label={`Digit ${i + 1}`}
            />
          ))}
        </div>

        {error && (
          <p className="text-center text-xs text-destructive">{error}</p>
        )}

        <button
          type="submit"
          className={cn(buttonVariants(), "w-full")}
          disabled={!isComplete || isVerifying}
        >
          {isVerifying ? (
            <>
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              Verifying…
            </>
          ) : (
            "Verify Email"
          )}
        </button>
      </form>

      {/* Resend section */}
      <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
        <span>Didn&apos;t receive the code?</span>
        <button
          type="button"
          onClick={handleResend}
          disabled={countdown > 0 || isResending}
          className={cn(
            "font-medium transition-colors",
            countdown > 0 || isResending
              ? "cursor-not-allowed text-muted-foreground"
              : "text-primary hover:underline"
          )}
        >
          {isResending ? (
            <span className="flex items-center gap-1">
              <Icons.spinner className="h-3 w-3 animate-spin" />
              Sending…
            </span>
          ) : countdown > 0 ? (
            `Resend code in ${countdown}s`
          ) : (
            "Resend code"
          )}
        </button>
      </div>

      {/* Back link */}
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="text-center text-xs text-muted-foreground hover:text-foreground hover:underline"
        >
          ← Use a different email
        </button>
      )}
    </div>
  )
}
