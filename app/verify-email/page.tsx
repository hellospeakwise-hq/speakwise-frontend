"use client"

import { Suspense, useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { authApi } from "@/lib/api/auth"
import Link from "next/link"

// Inner component that uses useSearchParams — must be inside <Suspense>
function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [canResend, setCanResend] = useState(true)
  const [resendCooldown, setResendCooldown] = useState(0)
  const hasAutoSent = useRef(false)

  useEffect(() => {
    // Get email from URL params
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)

      // Auto-send OTP on first load
      if (!hasAutoSent.current) {
        hasAutoSent.current = true
        handleResendOtp(emailParam)
      }
    }
  }, [searchParams])

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [resendCooldown])

  const handleResendOtp = async (emailToUse?: string) => {
    const targetEmail = emailToUse || email
    if (!targetEmail.trim()) {
      toast.error("Please enter your email address")
      return
    }

    setIsResending(true)
    setCanResend(false)

    try {
      await authApi.resendOtp({ email: targetEmail })
      toast.success("Verification code sent to your email")
      setResendCooldown(60) // 60 second cooldown
    } catch (error: any) {
      console.error("Resend OTP error:", error)
      toast.error(error.message || "Failed to send code. Please try again.")
      setCanResend(true)
    } finally {
      setIsResending(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      toast.error("Please enter your email address")
      return
    }

    if (!otp.trim() || otp.length !== 6) {
      toast.error("Please enter the 6-digit verification code")
      return
    }

    setIsVerifying(true)

    try {
      await authApi.verifyOtp({ email: email.trim(), otp: otp.trim() })
      toast.success("Email verified successfully! You can now sign in.")

      // Redirect to signin with email pre-filled
      router.push(`/signin?email=${encodeURIComponent(email)}`)
    } catch (error: any) {
      console.error("Verify OTP error:", error)
      toast.error(error.message || "Invalid or expired code. Please try again.")
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
      {/* Header */}
      <div className="flex flex-col space-y-2 text-center">
        <Icons.mail className="mx-auto h-12 w-12 text-primary" />
        <h1 className="text-2xl font-semibold tracking-tight">
          Verify your email
        </h1>
        <p className="text-sm text-muted-foreground">
          We sent a 6-digit code to{" "}
          {email && <span className="font-medium text-foreground">{email}</span>}
        </p>
        <p className="text-xs text-muted-foreground">
          Check your inbox and enter the code below
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleVerify} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isVerifying}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="otp">Verification Code</Label>
          <Input
            id="otp"
            type="text"
            placeholder="000000"
            value={otp}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6)
              setOtp(value)
            }}
            maxLength={6}
            disabled={isVerifying}
            className="text-center text-2xl tracking-widest font-mono"
            required
          />
          <p className="text-xs text-muted-foreground">
            Enter the 6-digit code from your email
          </p>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isVerifying || otp.length !== 6}
        >
          {isVerifying && (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          )}
          Verify Email
        </Button>
      </form>

      {/* Resend */}
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Didn't receive the code?
        </p>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => handleResendOtp()}
          disabled={!canResend || isResending || resendCooldown > 0}
        >
          {isResending && (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          )}
          {resendCooldown > 0
            ? `Resend in ${resendCooldown}s`
            : "Resend Code"}
        </Button>
      </div>

      {/* Back to signin */}
      <div className="text-center">
        <Link
          href="/signin"
          className="text-sm text-muted-foreground hover:text-primary underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  )
}

// Outer page wraps the inner component in Suspense — required by Next.js
// when useSearchParams() is used inside a page during static generation.
export default function VerifyEmailPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-3">
            <Icons.spinner className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading…</p>
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </div>
  )
}
