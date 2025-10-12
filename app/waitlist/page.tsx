"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sparkles, Mail, CheckCircle } from "lucide-react"

export default function WaitlistPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    setError(null)

    try {
      const endpoint = process.env.NEXT_PUBLIC_WAITLIST_ENDPOINT
      if (!endpoint) {
        throw new Error("Missing NEXT_PUBLIC_WAITLIST_ENDPOINT")
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, source: "speakwise-waitlist" }),
      })

      if (!res.ok) {
        let message = "Failed to join waitlist"
        try {
          const data = await res.json()
          if (data?.errors?.[0]?.message) message = data.errors[0].message
        } catch {}
        throw new Error(message)
      }

      setSubmitted(true)
      setEmail("")
    } catch (err: any) {
      setError(err?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <Card className={`w-full max-w-md relative z-10 border shadow-2xl backdrop-blur-sm transform transition-all duration-700 ${
        mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}>
        <CardHeader className="text-center space-y-4">
          <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-600 rounded-full mx-auto transition-all duration-500 ${
            mounted ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
          }`}>
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          
          <div className="space-y-2">
            <CardTitle className={`text-3xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent transition-all duration-500 delay-200 ${
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}>
              SpeakWise
            </CardTitle>
            <div className={`inline-flex items-center gap-2 px-3 py-1 bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-200 rounded-full text-sm font-medium transition-all duration-500 delay-300 ${
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}>
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              Private Beta
            </div>
          </div>
          
          <p className={`text-muted-foreground transition-all duration-500 delay-400 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            Be among the first to experience the future of speaker feedback.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {submitted ? (
            <div className={`text-center py-8 space-y-4 transition-all duration-500 ${
              submitted ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
            }`}>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 dark:bg-emerald-950 rounded-full mx-auto">
                <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">You&apos;re in!</h3>
                <p className="text-sm text-muted-foreground">
                  We&apos;ll notify you as soon as we launch. Get ready for something amazing.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50 rounded-lg p-3 animate-in slide-in-from-top-2 duration-300">
                  {error}
                </div>
              )}
              
              <div className={`space-y-2 transition-all duration-500 delay-500 ${
                mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-12 bg-background/50 backdrop-blur-sm border-2 focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading || !email} 
                className={`w-full h-12 bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:opacity-50 ${
                  mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
                style={{ transitionDelay: '600ms' }}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Joining...
                  </div>
                ) : (
                  "Join the Waitlist"
                )}
              </Button>

              <p className={`text-xs text-muted-foreground text-center transition-all duration-500 delay-700 ${
                mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}>
                No spam, ever. We respect your inbox.
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}