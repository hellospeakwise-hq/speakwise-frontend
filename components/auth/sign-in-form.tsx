"use client"

import React, { useState, useEffect } from "react"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-sm font-medium text-red-500">{error}</div>}
        </CardContent>
        <CardFooter>
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
