"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/icons"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { initiateOAuthLogin } from "@/lib/utils/oauth"

export function SignUpForm() {
  const router = useRouter()
  const { register } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [nationality, setNationality] = useState("")
  const [username, setUsername] = useState("")

  const validateForm = () => {
    if (!firstName.trim()) {
      setError("First name is required")
      toast.error("First name is required")
      return false
    }
    if (!lastName.trim()) {
      setError("Last name is required")
      toast.error("Last name is required")
      return false
    }
    if (!nationality.trim()) {
      setError("Nationality is required")
      toast.error("Nationality is required")
      return false
    }

    if (!username.trim()) {
      setError("Username is required")
      toast.error("Username is required")
      return false
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters long")
      toast.error("Username must be at least 3 characters long")
      return false
    }

    if (!email.trim()) {
      setError("Email is required")
      toast.error("Email is required")
      return false
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      toast.error("Please enter a valid email address")
      return false
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      toast.error("Password must be at least 8 characters long")
      return false
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      toast.error("Passwords do not match")
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
      toast.loading("Creating your account...", { id: "registration" })
      
      // Register the user with the auth context
      await register(
        firstName, 
        lastName, 
        nationality, 
        username, 
        email, 
        password
      )
      
      toast.success("🎉 Account created successfully! Please sign in to continue.", { 
        id: "registration",
        duration: 3000 
      })
      
      // Redirect to signin - user needs to login to get tokens
      setTimeout(() => {
        router.push("/signin")
      }, 1500)
      
    } catch (error: any) {
      console.error("Registration error:", error)
      const errorMessage = error.message || "Failed to create account. Please try again."
      setError(errorMessage)
      
      toast.error(`❌ Registration failed: ${errorMessage}`, { 
        id: "registration",
        duration: 5000 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignup = (provider: 'github' | 'google') => {
    initiateOAuthLogin(provider)
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                autoComplete="given-name"
                disabled={isLoading}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                autoComplete="family-name"
                disabled={isLoading}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="johndoe"
                autoComplete="username"
                disabled={isLoading}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nationality">Nationality</Label>
              <Input
                id="nationality"
                type="text"
                placeholder="e.g., USA"
                autoComplete="country-name"
                disabled={isLoading}
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                required
              />
            </div>
          </div>

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
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? (
                  <Icons.eyeOff className="h-4 w-4" />
                ) : (
                  <Icons.eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="px-1 text-xs text-muted-foreground">
              Must be at least 8 characters long
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isLoading}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <Icons.eyeOff className="h-4 w-4" />
                ) : (
                  <Icons.eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="px-1 text-xs text-red-600">{error}</p>
          )}

          <button
            type="submit"
            className={cn(buttonVariants())}
            disabled={isLoading}
          >
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create Account
          </button>
        </div>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or sign up with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "w-full"
          )}
          onClick={() => handleOAuthSignup('github')}
        >
          <Icons.gitHub className="mr-2 h-4 w-4" />
          GitHub
        </button>
        <button
          type="button"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "w-full"
          )}
          onClick={() => handleOAuthSignup('google')}
        >
          <Icons.google className="mr-2 h-4 w-4" />
          Google
        </button>
      </div>

      <p className="px-8 text-center text-xs text-muted-foreground">
        By clicking continue, you agree to our{" "}
        <Link
          href="/terms"
          className="underline underline-offset-4 hover:text-primary"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy"
          className="underline underline-offset-4 hover:text-primary"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  )
}
