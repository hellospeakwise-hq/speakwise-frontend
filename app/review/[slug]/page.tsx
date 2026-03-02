'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
    Star, MessageSquare, Send, CheckCircle2, XCircle,
    Loader2, Mic, Clock, Tag, ChevronLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { publicTalksApi, type Talk, type TalkReview } from '@/lib/api/talksApi'

// ─── Star rating picker ───────────────────────────────────────────────────────

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    const [hover, setHover] = useState(0)
    const active = hover || value

    const label =
        active === 0 ? 'Tap to rate' :
        active === 1 ? 'Poor' :
        active === 2 ? 'Fair' :
        active === 3 ? 'Good' :
        active === 4 ? 'Great' :
                        'Excellent!'

    return (
        <div className="flex flex-col items-start gap-1.5">
            <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                    <button
                        key={n}
                        type="button"
                        onClick={() => onChange(n)}
                        onMouseEnter={() => setHover(n)}
                        onMouseLeave={() => setHover(0)}
                        className="transition-transform hover:scale-110 focus:outline-none"
                        aria-label={`${n} star${n > 1 ? 's' : ''}`}
                    >
                        <Star
                            className={`h-10 w-10 transition-colors ${
                                n <= active
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-muted-foreground'
                            }`}
                        />
                    </button>
                ))}
            </div>
            <span className={`text-sm font-medium ${active === 0 ? 'text-muted-foreground' : 'text-orange-500'}`}>
                {label}
            </span>
        </div>
    )
}

// ─── Review list item ─────────────────────────────────────────────────────────

function ReviewItem({ review }: { review: TalkReview }) {
    return (
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                        key={n}
                        className={`h-4 w-4 ${n <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`}
                    />
                ))}
            </div>
            <p className="text-sm text-foreground leading-relaxed">{review.comment}</p>
        </div>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TalkReviewPage() {
    const params = useParams<{ slug: string }>()
    const slug = params.slug

    const [talk, setTalk] = useState<Talk | null>(null)
    const [reviews, setReviews] = useState<TalkReview[]>([])
    const [loadingTalk, setLoadingTalk] = useState(true)
    const [notFound, setNotFound] = useState(false)

    // Form state
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [submitError, setSubmitError] = useState('')

    useEffect(() => {
        if (!slug) return
        const fetchData = async () => {
            try {
                const [t, r] = await Promise.allSettled([
                    publicTalksApi.getTalkBySlug(slug),
                    publicTalksApi.getReviews(slug),
                ])
                if (t.status === 'fulfilled') setTalk(t.value)
                else setNotFound(true)
                if (r.status === 'fulfilled') setReviews(r.value)
            } finally {
                setLoadingTalk(false)
            }
        }
        fetchData()
    }, [slug])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (rating === 0) { setSubmitError('Please choose a star rating.'); return }
        if (comment.trim().length < 5) { setSubmitError('Please write at least a few words.'); return }

        setSubmitError('')
        setSubmitting(true)
        try {
            const review = await publicTalksApi.submitReview(slug, { rating, comment: comment.trim() })
            setReviews((prev) => [review, ...prev])
            setSubmitted(true)
        } catch (err: any) {
            setSubmitError(err.message || 'Something went wrong — please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    // ── States ────────────────────────────────────────────────────────────────

    if (loadingTalk) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
        )
    }

    if (notFound || !talk) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4 px-4 text-center">
                <XCircle className="h-12 w-12 text-muted-foreground" />
                <h1 className="text-2xl font-bold">Talk not found</h1>
                <p className="text-muted-foreground text-sm max-w-sm">
                    This review link may have expired or the talk hasn't been made public yet.
                </p>
                <Link href="/speakers">
                    <Button variant="outline" className="gap-2">
                        <ChevronLeft className="h-4 w-4" />
                        Browse Speakers
                    </Button>
                </Link>
            </div>
        )
    }

    const avgRating = reviews.length
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
        : null

    return (
        <div className="min-h-screen bg-background">
            {/* Hero header */}
            <div className="bg-gradient-to-br from-orange-500/10 via-background to-background border-b border-border">
                <div className="max-w-2xl mx-auto px-4 py-10 space-y-4">
                    <Link href="/speakers" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <ChevronLeft className="h-3.5 w-3.5" />
                        Back to Speakers
                    </Link>

                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            <Image
                                src="/icons/icon-96x96.png"
                                alt="SpeakWise"
                                width={40}
                                height={40}
                                className="object-contain"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl font-bold leading-snug">{talk.title}</h1>
                            <p className="text-sm text-muted-foreground mt-1">by {talk.speaker_name}</p>
                        </div>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <Badge variant="secondary" className="text-xs capitalize">{talk.category}</Badge>
                        <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {talk.duration} min
                        </span>
                        {avgRating !== null && (
                            <span className="flex items-center gap-1">
                                <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                                <strong>{avgRating.toFixed(1)}</strong>
                                <span>avg ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
                            </span>
                        )}
                    </div>

                    {talk.description && (
                        <div
                            className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed border-t border-border pt-4"
                            dangerouslySetInnerHTML={{ __html: talk.description }}
                        />
                    )}
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-8 space-y-10">

                {/* ── Submission form ───────────────────────────────────────── */}
                {talk.is_reviewable ? (
                    submitted ? (
                        <div className="flex flex-col items-center gap-4 py-10 text-center">
                            <CheckCircle2 className="h-14 w-14 text-green-500" />
                            <h2 className="text-xl font-bold">Thank you for your feedback!</h2>
                            <p className="text-sm text-muted-foreground max-w-xs">
                                Your review helps {talk.speaker_name} improve their talks. 🙏
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border rounded-2xl p-6">
                            <div>
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5 text-orange-500" />
                                    Leave a Review
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    No account needed your feedback is anonymous.
                                </p>
                            </div>

                            {/* Star picker */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Your Rating</label>
                                <StarPicker value={rating} onChange={setRating} />
                            </div>

                            {/* Comment */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium" htmlFor="comment">
                                    Your Comment
                                </label>
                                <Textarea
                                    id="comment"
                                    placeholder="What did you think about the talk? Any key takeaways or suggestions…"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    rows={4}
                                    className="resize-none"
                                />
                                <p className="text-xs text-muted-foreground text-right">{comment.length} characters</p>
                            </div>

                            {submitError && (
                                <p className="text-sm text-destructive flex items-center gap-1.5">
                                    <XCircle className="h-4 w-4 flex-shrink-0" />
                                    {submitError}
                                </p>
                            )}

                            <Button
                                type="submit"
                                disabled={submitting}
                                className="w-full gap-2 bg-orange-500 hover:bg-orange-600 text-white"
                            >
                                {submitting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                                {submitting ? 'Submitting…' : 'Submit Review'}
                            </Button>
                        </form>
                    )
                ) : (
                    <div className="flex flex-col items-center gap-3 py-10 text-center border border-dashed border-border rounded-2xl">
                        <XCircle className="h-10 w-10 text-muted-foreground" />
                        <h2 className="text-lg font-semibold">Reviews are closed</h2>
                        <p className="text-sm text-muted-foreground max-w-xs">
                            The speaker has closed the review window for this talk.
                        </p>
                    </div>
                )}

                {/* ── Existing reviews ──────────────────────────────────────── */}
                {reviews.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-base font-semibold flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-orange-500" />
                            All Reviews
                            <span className="text-muted-foreground font-normal text-sm">({reviews.length})</span>
                        </h2>
                        <div className="space-y-3">
                            {reviews.map((r) => (
                                <ReviewItem key={r.id} review={r} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
