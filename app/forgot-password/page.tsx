"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { authApi } from "@/lib/api/auth"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      toast.error("Email is required")
      return
    }

    setIsLoading(true)
    try {
      await authApi.requestPasswordReset({ email })
      toast.success("If an account exists, a reset email has been sent.")
      router.push("/reset-password")
    } catch (error: any) {
      if (error?.response?.data) {
        console.log('Password reset error response:', error.response.data)
      } else {
        console.log('Password reset error:', error)
      }
      const msg = error?.response?.data?.email?.[0] || error?.response?.data?.detail || error?.message || "Failed to request password reset"
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-md py-10">
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Forgot Password</CardTitle>
            <CardDescription>Enter your email to receive a password reset token</CardDescription>
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
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Reset Email"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
