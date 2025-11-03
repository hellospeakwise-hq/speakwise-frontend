"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"

const Icons = {
  spinner: Loader2,
}

export function SignUpForm() {
  const router = useRouter()
  const { register } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
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
      
      toast.success("🎉 Account created successfully! Redirecting to sign in...", { 
        id: "registration",
        duration: 3000 
      })
      
      // Wait a bit before redirecting to show the success message
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

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Sign Up</CardTitle>
          <CardDescription>Create your SpeakWise account. All users start as speakers and can create organizations later.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="johndoe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input
                    id="nationality"
                    type="text"
                    placeholder="e.g., USA"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                Sign Up
              </Button>
            </CardContent>
            <CardFooter>
              <p className="px-8 text-center text-sm text-muted-foreground">
                By clicking continue, you agree to our{" "}
                <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
                  Privacy Policy
                </Link>
                .
              </p>
            </CardFooter>
          </form>
        </Card>
  )
}
