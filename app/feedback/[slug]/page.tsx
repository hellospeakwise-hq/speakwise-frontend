'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import {
    Send, CheckCircle2, XCircle, Loader2, Clock, AlertTriangle, Mic, Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    feedbackAPI,
    FeedbackNotOpenError,
    FeedbackCooldownError,
    type FeedbackSubmit,
    type FeedbackSubmitted,
    type ExperienceInfo,
} from '@/lib/api/feedbackApi'

// ─── Types & Constants ────────────────────────────────────────────────────────

const CRITERIA: { key: keyof Omit<FeedbackSubmit, 'name' | 'comments'>; label: string; description: string }[] = [
    { key: 'overall_rating', label: 'Overall', description: 'Your overall impression of the talk' },
    { key: 'engagement', label: 'Engagement', description: 'How engaging and captivating was the speaker?' },
    { key: 'clarity', label: 'Clarity', description: 'How clearly were ideas explained?' },
    { key: 'content_depth', label: 'Content Depth', description: 'How thorough and well-researched was the content?' },
    { key: 'speaker_knowledge', label: 'Knowledge', description: 'How knowledgeable did the speaker seem?' },
    { key: 'practical_relevance', label: 'Practical Relevance', description: 'How actionable and applicable was this talk?' },
]

type Ratings = Record<keyof Omit<FeedbackSubmit, 'name' | 'comments'>, number>

const DEFAULT_RATINGS: Ratings = {
    overall_rating: 0,
    engagement: 0,
    clarity: 0,
    content_depth: 0,
    speaker_knowledge: 0,
    practical_relevance: 0,
}

// ─── Number picker (1–10) ─────────────────────────────────────────────────────

function RatingPicker({
    label,
    description,
    value,
    onChange,
}: {
    label: string
    description: string
    value: number
    onChange: (v: number) => void
}) {
    const color = (n: number) => {
        if (n === 0) return 'bg-muted text-muted-foreground'
        if (n <= value) {
            if (value <= 4) return 'bg-red-500 text-white'
            if (value <= 6) return 'bg-yellow-500 text-white'
            if (value <= 8) return 'bg-lime-500 text-white'
            return 'bg-green-500 text-white'
        }
        return 'bg-muted text-muted-foreground hover:bg-muted/80'
    }

    return (
        <div className="space-y-2">
            <div>
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                    <button
                        key={n}
                        type="button"
                        onClick={() => onChange(n)}
                        aria-label={`${label} ${n} out of 10`}
                        className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${color(n)} ${
                            n <= value ? 'scale-105 shadow-sm' : 'hover:scale-105'
                        }`}
                    >
                        {n}
                    </button>
                ))}
            </div>
            {value > 0 && (
                <p className="text-xs font-medium text-orange-500">{value}/10</p>
            )}
        </div>
    )
}

// ─── Success state ────────────────────────────────────────────────────────────

function SuccessView({ result }: { result: FeedbackSubmitted }) {
    return (
        <div className="flex flex-col items-center gap-5 py-14 text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
            <div>
                <h2 className="text-2xl font-bold">Thank you!</h2>
                <p className="text-muted-foreground mt-1 text-sm max-w-xs mx-auto">
                    {result.is_anonymous
                        ? 'Your anonymous feedback has been recorded.'
                        : `Thanks ${result.name}, your feedback has been recorded.`}
                </p>
            </div>
            {result.experience && (
                <div className="mt-2 px-5 py-3 rounded-xl bg-muted text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{result.experience.topic}</span>
                    {' at '}
                    <span className="font-medium text-foreground">{result.experience.event_name}</span>
                </div>
            )}
            <p className="text-xs text-muted-foreground max-w-xs">
                Your feedback helps the speaker improve. It&apos;s been submitted anonymously unless you provided your name.
            </p>
        </div>
    )
}

// ─── Error state ──────────────────────────────────────────────────────────────

function BlockedView({
    icon: Icon,
    title,
    body,
    children,
}: {
    icon: React.ElementType
    title: string
    body: string
    children?: React.ReactNode
}) {
    return (
        <div className="flex flex-col items-center gap-4 py-14 text-center border border-dashed border-border rounded-2xl px-6">
            <Icon className="h-12 w-12 text-muted-foreground" />
            <div>
                <h2 className="text-lg font-semibold">{title}</h2>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">{body}</p>
            </div>
            {children}
        </div>
    )
}

// ─── Presentation header ──────────────────────────────────────────────────────

function PresentationHeader({ info }: { info: ExperienceInfo | null; loading: boolean }) {
    return (
        <div className="border-b border-white/5 bg-zinc-950">
            <div className="max-w-xl mx-auto px-4 py-6">
                {/* SpeakWise brand */}
                <div className="flex items-center gap-2 mb-5">
                    <Image
                        src="/logo-white.png"
                        alt="SpeakWise"
                        width={100}
                        height={40}
                        className="h-8 w-auto"
                    />
                </div>

                {info ? (
                    <div className="space-y-3">
                        {/* Talk title */}
                        <h1 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                            {info.topic}
                        </h1>

                        {/* Speaker + event */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-zinc-400">
                            {info.speaker_name && (
                                <span className="flex items-center gap-1.5">
                                    <Mic className="h-3.5 w-3.5 text-orange-400 flex-shrink-0" />
                                    <span className="font-medium text-zinc-200">{info.speaker_name}</span>
                                </span>
                            )}
                            <span className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-orange-400 flex-shrink-0" />
                                <span>
                                    {info.event_name}
                                    {info.event_date && (
                                        <> &middot; {new Date(info.event_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</>
                                    )}
                                </span>
                            </span>
                        </div>

                        <p className="text-xs text-zinc-500 pt-1">
                            No account needed &middot; Anonymous by default
                        </p>
                    </div>
                ) : (
                    // Skeleton while loading
                    <div className="space-y-2 animate-pulse">
                        <div className="h-6 bg-zinc-800 rounded w-3/4" />
                        <div className="h-4 bg-zinc-800 rounded w-1/2" />
                        <div className="h-3 bg-zinc-800 rounded w-1/3" />
                    </div>
                )}
            </div>
        </div>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FeedbackPage() {
    const { slug } = useParams<{ slug: string }>()

    // Presentation info
    const [info, setInfo] = useState<ExperienceInfo | null>(null)
    const [infoLoading, setInfoLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)

    // Form state
    const [ratings, setRatings] = useState<Ratings>({ ...DEFAULT_RATINGS })
    const [name, setName] = useState('')
    const [comments, setComments] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState('')
    const [blockedType, setBlockedType] = useState<'date-gated' | 'disabled' | 'cooldown' | null>(null)
    const [result, setResult] = useState<FeedbackSubmitted | null>(null)

    // Fetch presentation info on mount — detect blocked state immediately
    useEffect(() => {
        if (!slug) return
        feedbackAPI
            .getExperienceInfo(slug)
            .then((data) => {
                setInfo(data)
                // Show blocked state right away — no need to wait for a failed POST
                if (!data.is_open) {
                    setBlockedType('date-gated')
                } else if (!data.feedback_enabled) {
                    setBlockedType('disabled')
                }
            })
            .catch(() => setNotFound(true))
            .finally(() => setInfoLoading(false))
    }, [slug])

    const allRated = Object.values(ratings).every((v) => v > 0)

    const setRating = (key: keyof Ratings, value: number) =>
        setRatings((prev) => ({ ...prev, [key]: value }))

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!allRated) {
            setSubmitError('Please rate all criteria before submitting.')
            return
        }

        setSubmitError('')
        setSubmitting(true)
        try {
            const payload: FeedbackSubmit = {
                ...ratings,
                name: name.trim() || undefined,
                comments: comments.trim() || undefined,
            }
            const submitted = await feedbackAPI.submitFeedback(slug, payload)
            setResult(submitted)
        } catch (err) {
            if (err instanceof FeedbackNotOpenError) {
                setBlockedType(info?.feedback_enabled === false ? 'disabled' : 'date-gated')
            } else if (err instanceof FeedbackCooldownError) {
                setBlockedType('cooldown')
            } else {
                setSubmitError(
                    err instanceof Error ? err.message : 'Something went wrong — please try again.'
                )
            }
        } finally {
            setSubmitting(false)
        }
    }

    // Not found state
    if (!infoLoading && notFound) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col">
                <div className="border-b border-white/5 bg-zinc-950 px-4 py-6">
                    <Image src="/logo-white.png" alt="SpeakWise" width={100} height={40} className="h-8 w-auto" />
                </div>
                <div className="flex-1 flex items-center justify-center px-4">
                    <div className="text-center space-y-3">
                        <XCircle className="h-12 w-12 text-zinc-600 mx-auto" />
                        <h1 className="text-xl font-bold text-white">Presentation not found</h1>
                        <p className="text-sm text-zinc-500 max-w-xs">
                            This feedback link may have expired or been disabled by the speaker.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header — dark branded strip */}
            <PresentationHeader info={info} loading={infoLoading} />

            <div className="max-w-xl mx-auto px-4 py-8">
                {result ? (
                    <SuccessView result={result} />
                ) : blockedType === 'date-gated' ? (
                    <BlockedView
                        icon={Clock}
                        title="Feedback opens on the day of the talk"
                        body={`This QR code is ready — feedback will open on ${
                            info?.event_date
                                ? new Date(info.event_date).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })
                                : 'the event date'
                        }. Come back on the day of the presentation to submit your rating.`}
                    >
                        {info?.event_date && (
                            <div className="mt-1 px-4 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-sm font-semibold text-orange-400">
                                📅 Opens {new Date(info.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                        )}
                    </BlockedView>
                ) : blockedType === 'disabled' ? (
                    <BlockedView
                        icon={XCircle}
                        title="Feedback is currently paused"
                        body="The speaker has temporarily disabled feedback for this presentation. Please check back later or ask the speaker to re-enable it."
                    />
                ) : blockedType === 'cooldown' ? (
                    <BlockedView
                        icon={AlertTriangle}
                        title="Already submitted"
                        body="You've already submitted feedback for this presentation recently. Only one submission per attendee is allowed within the cooldown window."
                    />
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Rating Criteria */}
                        <div className="bg-card border border-border rounded-2xl p-6 space-y-7">
                            <div>
                                <h2 className="text-base font-semibold">Your Ratings</h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Score each category from 1 (poor) to 10 (excellent)
                                </p>
                            </div>

                            {CRITERIA.map(({ key, label, description }) => (
                                <RatingPicker
                                    key={key}
                                    label={label}
                                    description={description}
                                    value={ratings[key]}
                                    onChange={(v) => setRating(key, v)}
                                />
                            ))}
                        </div>

                        {/* Optional details */}
                        <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
                            <div>
                                <h2 className="text-base font-semibold">Optional Details</h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Leave blank to submit anonymously
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm">
                                    Your Name
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. Jane Smith (leave blank to stay anonymous)"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    maxLength={100}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="comments" className="text-sm">
                                    Comments
                                </Label>
                                <Textarea
                                    id="comments"
                                    placeholder="What did you think? Any key takeaways or suggestions…"
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                    rows={4}
                                    className="resize-none"
                                    maxLength={2000}
                                />
                                <p className="text-xs text-muted-foreground text-right">
                                    {comments.length}/2000
                                </p>
                            </div>
                        </div>

                        {/* Validation error */}
                        {submitError && (
                            <p className="text-sm text-destructive flex items-center gap-1.5">
                                <XCircle className="h-4 w-4 flex-shrink-0" />
                                {submitError}
                            </p>
                        )}

                        <Button
                            type="submit"
                            disabled={submitting || !allRated}
                            className="w-full gap-2 bg-orange-500 hover:bg-orange-600 text-white h-12 text-base font-semibold"
                        >
                            {submitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                            {submitting ? 'Submitting…' : 'Submit Feedback'}
                        </Button>

                        <p className="text-center text-xs text-muted-foreground">
                            Powered by{' '}
                            <span className="font-semibold text-orange-500">SpeakWise</span>
                            {' · '}
                            Only a salted hash of your IP is stored to prevent duplicates.
                        </p>
                    </form>
                )}
            </div>
        </div>
    )
}
