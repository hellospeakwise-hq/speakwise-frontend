"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/icons"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"

export function SignInForm() {
  const router = useRouter()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  // Always clear form state on mount (prevents name/email carryover)
  useEffect(() => {
    setEmail("")
    setPassword("")
    setError("")
  }, [])

  const validateForm = () => {
    if (!email.trim()) {
      setError("Email is required")
      toast.error("Email is required")
      return false
    }

    if (!password.trim()) {
      setError("Password is required")
      toast.error("Password is required")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const redirectPath = await login(email, password)

      toast.success("Welcome back! You've been signed in successfully.")
      router.push(redirectPath)
    } catch (error: any) {
      console.error("Login error:", error)
      
      // Provide user-friendly error messages
      let errorMessage = "Invalid credentials. Please check your email and password."
      
      if (error?.message) {
        // Use the message from our improved auth API
        errorMessage = error.message;
      } else if (error?.response?.status === 400 || error?.response?.status === 401) {
        errorMessage = "Incorrect email or password";
      } else if (!error?.response) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (error?.response?.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      }
      
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-muted-foreground underline-offset-4 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <p className="px-1 text-xs text-red-600">{error}</p>
          )}
          <button
            className={cn(buttonVariants())}
            disabled={isLoading}
            type="submit"
          >
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Sign In
          </button>
        </div>
      </form>
    </div>
  )
}
