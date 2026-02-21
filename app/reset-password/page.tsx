'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { authApiSimple } from '@/lib/api/authApiSimple'
import { toast } from 'sonner'
import { Loader2, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'

function ResetPasswordContent() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [token, setToken] = useState('')
    const [email, setEmail] = useState('')
    const [isValid, setIsValid] = useState<boolean | null>(null)
    const [success, setSuccess] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const resetToken = searchParams.get('token')
        // Read email from URL params (backend now includes it in the reset link)
        const resetEmail = searchParams.get('email') || sessionStorage.getItem('resetPasswordEmail')

        if (!resetToken) {
            setIsValid(false)
            toast.error('Invalid reset link')
            return
        }

        if (!resetEmail) {
            setIsValid(false)
            toast.error('Session expired. Please request a new reset link.')
            return
        }

        setToken(resetToken)
        setEmail(resetEmail)
        setIsValid(true)
    }, [searchParams])

    const validatePassword = () => {
        if (password.length < 8) {
            toast.error('Password must be at least 8 characters long')
            return false
        }
        if (password !== confirmPassword) {
            toast.error('Passwords do not match')
            return false
        }
        return true
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validatePassword()) {
            return
        }

        try {
            setLoading(true)
            await authApiSimple.confirmPasswordReset(email, token, password)
            setSuccess(true)
            toast.success('Password reset successfully!')
            // Clear stored email
            sessionStorage.removeItem('resetPasswordEmail')
            setTimeout(() => {
                router.push('/signin')
            }, 2000)
        } catch (error) {
            console.error('Reset password error:', error)
            toast.error(
                error instanceof Error ? error.message : 'Failed to reset password'
            )
        } finally {
            setLoading(false)
        }
    }

    if (isValid === false) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 py-12">
                <Card className="w-full max-w-md border-red-200">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <AlertCircle className="h-12 w-12 text-red-600" />
                        </div>
                        <CardTitle className="text-2xl">Invalid reset link</CardTitle>
                        <CardDescription className="mt-2">
                            The password reset link is invalid or has expired.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Password reset links expire after 24 hours for security reasons.
                        </p>
                        <Button asChild className="w-full">
                            <Link href="/forgot-password">Request a new reset link</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 py-12">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <CheckCircle className="h-12 w-12 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl">Password reset successfully</CardTitle>
                        <CardDescription className="mt-2">
                            Your password has been updated. Redirecting to sign in...
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full">
                            <Link href="/signin">Sign in now</Link>
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
                    <CardTitle className="text-2xl">Reset your password</CardTitle>
                    <CardDescription>
                        Enter your new password below.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium">
                                New password
                            </label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter new password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                    required
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                At least 8 characters
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="confirm-password" className="text-sm font-medium">
                                Confirm password
                            </label>
                            <div className="relative">
                                <Input
                                    id="confirm-password"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="Confirm your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={loading}
                                    required
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Resetting...
                                </>
                            ) : (
                                'Reset password'
                            )}
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            asChild
                            className="w-full"
                        >
                            <Link href="/signin">Back to sign in</Link>
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <ResetPasswordContent />
        </Suspense>
    )
}
