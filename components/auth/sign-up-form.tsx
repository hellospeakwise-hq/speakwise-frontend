"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"

export function SignUpForm() {
  const router = useRouter()
  const { register } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [userType, setUserType] = useState("attendee")
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
        password,
        userType as 'attendee' | 'speaker' | 'organizer'
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
    <Card className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>Create your SpeakWise account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value)
                // Auto-generate username if it's empty
                if (!username && e.target.value) {
                  const suggestedUsername = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '')
                  if (lastName) {
                    setUsername(suggestedUsername + lastName.toLowerCase().replace(/[^a-z0-9]/g, ''))
                  } else {
                    setUsername(suggestedUsername)
                  }
                }
              }}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value)
                // Auto-generate username if it's empty
                if (!username && firstName && e.target.value) {
                  const suggestedUsername = firstName.toLowerCase().replace(/[^a-z0-9]/g, '') + 
                                           e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '')
                  setUsername(suggestedUsername)
                }
              }}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nationality">Nationality</Label>
            <Input
              id="nationality"
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a unique username"
              required
            />
            <p className="text-xs text-muted-foreground">
              Username must be at least 3 characters long and unique
            </p>
          </div>
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
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">Password must be at least 8 characters long</p>
          </div>
          <div className="space-y-2">
            <Label>I am a:</Label>
            <RadioGroup value={userType} onValueChange={setUserType} className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="attendee" id="attendee" />
                <Label htmlFor="attendee" className="font-normal">
                  Conference Attendee
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="speaker" id="speaker" />
                <Label htmlFor="speaker" className="font-normal">
                  Speaker
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="organizer" id="organizer" />
                <Label htmlFor="organizer" className="font-normal">
                  Event Organizer
                </Label>
              </div>
            </RadioGroup>
          </div>
          {error && <div className="text-sm font-medium text-red-500">{error}</div>}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            By clicking create account, you agree to our{" "}
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
