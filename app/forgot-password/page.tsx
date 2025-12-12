'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { authApiSimple } from '@/lib/api/authApiSimple'
import { toast } from 'sonner'
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!email) {
            toast.error('Please enter your email address')
            return
        }

        try {
            setLoading(true)
            await authApiSimple.requestPasswordReset(email)
            // Store email in sessionStorage to use on reset-password page
            sessionStorage.setItem('resetPasswordEmail', email)
            setSubmitted(true)
            toast.success('Check your email for password reset instructions')
        } catch (error) {
            console.error('Password reset error:', error)
            toast.error(
                error instanceof Error ? error.message : 'Failed to send reset email'
            )
        } finally {
            setLoading(false)
        }
    }

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 py-12">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <CheckCircle className="h-12 w-12 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl">Check your email</CardTitle>
                        <CardDescription className="mt-2 text-base">
                            We've sent password reset instructions to
                            <br />
                            <span className="font-semibold text-foreground">{email}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground text-center">
                            Click the link in the email to reset your password. The link will expire in 24 hours.
                        </p>

                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                                Didn't receive the email? Check your spam folder or try again.
                            </p>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => {
                                    setSubmitted(false)
                                    setEmail('')
                                }}
                            >
                                Try another email
                            </Button>
                        </div>

                        <Button asChild variant="outline" className="w-full">
                            <Link href="/signin">Back to sign in</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Forgot password?</CardTitle>
                    <CardDescription>
                        Enter your email and we'll send you a link to reset your password.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">
                                Email address
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                'Send reset link'
                            )}
                        </Button>

                        <Button
                            type="button"
                            variant="ghost"
                            asChild
                            className="w-full"
                        >
                            <Link href="/signin" className="flex items-center justify-center gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Back to sign in
                            </Link>
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
