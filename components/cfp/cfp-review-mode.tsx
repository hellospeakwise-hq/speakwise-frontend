'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    X, SkipForward, ArrowRight, Loader2,
    Trophy, RefreshCw, ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
    cfpApi,
    type CFPReview,
    type CFPSubmissionWithScore,
    TALK_TYPE_LABELS,
    AUDIENCE_LABELS,
    CFP_CATEGORIES,
} from '@/lib/api/cfpApi'
import { MarkdownContent } from '@/components/ui/markdown-content'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const EASE_OUT = [0.23, 1, 0.32, 1] as const

interface CFPReviewModeProps {
    eventSlug: string
    onClose: () => void
}

type Tab = 'proposal' | 'reviews'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="grid grid-cols-[160px_1fr] gap-x-8 py-2.5 border-b border-border/50 last:border-0">
            <dt className="text-sm font-medium text-foreground">{label}</dt>
            <dd className="text-sm text-muted-foreground">{children}</dd>
        </div>
    )
}

function ProposalTab({ sub }: { sub: CFPSubmissionWithScore }) {
    const getCategoryLabel = (value: string) =>
        CFP_CATEGORIES.find(c => c.value === value)?.label ?? value

    return (
        <div className="space-y-8">
            {/* Core fields */}
            <dl className="divide-y divide-border/40">
                <Field label="Title">{sub.title || sub.elevator_pitch}</Field>
                <Field label="Speaker">{sub.submitter_email}</Field>
                <Field label="Category">{getCategoryLabel(sub.category)}</Field>
                <Field label="Session type">
                    {TALK_TYPE_LABELS[sub.talk_type]}
                    {sub.duration ? ` (${sub.duration} minutes)` : ''}
                </Field>
                <Field label="Audience">{AUDIENCE_LABELS[sub.audience]}</Field>
                {sub.language && (
                    <Field label="Language">{sub.language}</Field>
                )}
                {sub.is_first_time_speaker && (
                    <Field label="First-time speaker">Yes</Field>
                )}
                {sub.travel_support_needed && (
                    <Field label="Travel support">Requested</Field>
                )}
                {(sub.slides_url || sub.recording_url) && (
                    <Field label="Links">
                        <div className="flex gap-4">
                            {sub.slides_url && (
                                <a href={sub.slides_url} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-orange-500 hover:underline">
                                    <ExternalLink className="h-3.5 w-3.5" /> Slides
                                </a>
                            )}
                            {sub.recording_url && (
                                <a href={sub.recording_url} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-orange-500 hover:underline">
                                    <ExternalLink className="h-3.5 w-3.5" /> Recording
                                </a>
                            )}
                        </div>
                    </Field>
                )}
            </dl>

            {/* Long-form content */}
            {sub.elevator_pitch && sub.title && (
                <div>
                    <p className="text-xs text-muted-foreground mb-2">Elevator pitch</p>
                    <p className="text-sm text-muted-foreground italic leading-relaxed">{sub.elevator_pitch}</p>
                </div>
            )}

            {sub.abstract && (
                <div>
                    <p className="text-xs text-muted-foreground mb-2">Abstract</p>
                    <MarkdownContent content={sub.abstract} className="text-sm text-foreground/80 leading-relaxed" />
                </div>
            )}

            {sub.outline && (
                <div>
                    <p className="text-xs text-muted-foreground mb-2">Outline</p>
                    <MarkdownContent content={sub.outline} className="text-sm text-foreground/80 leading-relaxed" />
                </div>
            )}

            {sub.notes_for_organizers && (
                <div className="rounded border border-border bg-muted/40 px-4 py-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-1.5">Notes for organizers</p>
                    <p className="text-sm text-foreground/80">{sub.notes_for_organizers}</p>
                </div>
            )}

            {(sub.co_speakers_detail?.length > 0 || sub.other_speakers_text) && (
                <div>
                    <p className="text-xs text-muted-foreground mb-2">Co-speakers</p>
                    {sub.co_speakers_detail?.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                            {sub.co_speakers_detail.map(s => s.name).join(', ')}
                        </p>
                    )}
                    {sub.other_speakers_text && (
                        <p className="text-sm text-muted-foreground mt-1">{sub.other_speakers_text}</p>
                    )}
                </div>
            )}
        </div>
    )
}

function ReviewsTab({
    sub,
    score,
    notes,
    submitting,
    onScoreChange,
    onNotesChange,
    onSubmit,
    onSkip,
}: {
    sub: CFPSubmissionWithScore
    score: number | null
    notes: string
    submitting: boolean
    onScoreChange: (s: number) => void
    onNotesChange: (n: string) => void
    onSubmit: () => void
    onSkip: () => void
}) {
    const reviews = sub.reviews_detail ?? []

    return (
        <div className="space-y-8">
            {/* Existing reviews table */}
            {reviews.length > 0 ? (
                <div>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left py-2 pr-6 font-medium text-muted-foreground w-20 text-xs">Score</th>
                                <th className="text-left py-2 pr-6 font-medium text-muted-foreground text-xs">Reviewer</th>
                                <th className="text-left py-2 font-medium text-muted-foreground text-xs">Notes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {reviews.map((r: CFPReview) => (
                                <tr key={r.id}>
                                    <td className="py-2.5 pr-6">
                                        <span className="tabular-nums font-semibold text-foreground">{r.score}</span>
                                    </td>
                                    <td className="py-2.5 pr-6 text-muted-foreground">
                                        {r.reviewer_name || r.reviewer_email.split('@')[0]}
                                    </td>
                                    <td className="py-2.5 text-muted-foreground/70 italic">
                                        {r.notes || '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        {reviews.length > 0 && (
                            <tfoot>
                                <tr className="border-t border-border">
                                    <td className="pt-2.5 pr-6">
                                        <span className="tabular-nums font-semibold text-foreground">{sub.avg_score}</span>
                                    </td>
                                    <td className="pt-2.5 text-xs text-muted-foreground" colSpan={2}>
                                        Average from {reviews.length} reviewer{reviews.length !== 1 ? 's' : ''}
                                    </td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">No reviews yet.</p>
            )}

            {/* Your review form */}
            <div className="border-t border-border pt-6 space-y-5">
                <p className="text-sm font-medium text-foreground">Your review</p>

                <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Score</p>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(n => (
                            <motion.button
                                key={n}
                                onClick={() => onScoreChange(n)}
                                whileTap={{ scale: 0.95 }}
                                transition={{ duration: 0.1, ease: EASE_OUT }}
                                className={cn(
                                    'w-9 h-9 rounded border text-sm font-semibold transition-colors duration-150',
                                    score === n
                                        ? 'border-orange-500 bg-orange-500 text-white'
                                        : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                                )}
                            >
                                {n}
                            </motion.button>
                        ))}
                        {score && (
                            <motion.span
                                key={score}
                                initial={{ opacity: 0, x: -4 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.15, ease: EASE_OUT }}
                                className="self-center text-xs text-muted-foreground ml-2"
                            >
                                {['', 'Weak', 'Below average', 'Average', 'Good', 'Excellent'][score]}
                            </motion.span>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Notes <span className="opacity-50">(optional)</span></p>
                    <Textarea
                        placeholder="Anything worth noting for the team…"
                        value={notes}
                        onChange={e => onNotesChange(e.target.value)}
                        rows={3}
                        className="text-sm resize-none"
                    />
                </div>

                <div className="flex items-center justify-between pt-1">
                    <motion.button
                        onClick={onSkip}
                        disabled={submitting}
                        whileTap={{ scale: 0.97 }}
                        transition={{ duration: 0.1, ease: EASE_OUT }}
                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
                    >
                        <SkipForward className="h-3.5 w-3.5" />
                        Skip
                    </motion.button>

                    <motion.div whileTap={{ scale: 0.97 }} transition={{ duration: 0.1, ease: EASE_OUT }}>
                        <Button
                            onClick={onSubmit}
                            disabled={!score || submitting}
                            className="gap-2 bg-orange-500 hover:bg-orange-600 text-white h-8 px-4 text-sm"
                        >
                            {submitting ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <>
                                    Submit & next
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </>
                            )}
                        </Button>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

function ProgressBar({ reviewed, total }: { reviewed: number; total: number }) {
    const pct = total > 0 ? (reviewed / total) * 100 : 0
    return (
        <div className="flex items-center gap-3">
            <div className="w-32 h-1 bg-muted rounded-full overflow-hidden">
                <div
                    className="h-full bg-orange-500 rounded-full origin-left"
                    style={{
                        transform: `scaleX(${pct / 100})`,
                        transition: 'transform 400ms cubic-bezier(0.23, 1, 0.32, 1)',
                    }}
                />
            </div>
            <span className="text-xs text-muted-foreground tabular-nums">{reviewed} / {total} reviewed</span>
        </div>
    )
}

const TABS: { key: Tab; label: string }[] = [
    { key: 'proposal', label: 'Proposal' },
    { key: 'reviews', label: 'Reviews' },
]

export function CFPReviewMode({ eventSlug, onClose }: CFPReviewModeProps) {
    const [submission, setSubmission] = useState<CFPSubmissionWithScore | null>(null)
    const [progress, setProgress] = useState({ reviewed: 0, total: 0 })
    const [score, setScore] = useState<number | null>(null)
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [done, setDone] = useState(false)
    const [activeTab, setActiveTab] = useState<Tab>('proposal')
    const contentRef = useRef<HTMLDivElement>(null)

    const loadNext = useCallback(async () => {
        setLoading(true)
        setScore(null)
        setNotes('')
        setActiveTab('proposal')
        if (contentRef.current) contentRef.current.scrollTop = 0
        try {
            const res = await cfpApi.getReviewQueue(eventSlug)
            if (!res) { setDone(true); return }
            setSubmission(res.submission)
            setProgress(res.progress)
            if (res.submission.my_score) setScore(res.submission.my_score)
        } catch {
            toast.error('Failed to load next submission')
        } finally {
            setLoading(false)
        }
    }, [eventSlug])

    useEffect(() => { loadNext() }, [loadNext])

    const handleSubmit = async () => {
        if (!submission || !score) return
        setSubmitting(true)
        try {
            await cfpApi.submitReview(submission.id, score, notes)
            toast.success(`Scored ${score}/5`)
            setProgress(p => ({ ...p, reviewed: p.reviewed + (submission.my_score ? 0 : 1) }))
            loadNext()
        } catch {
            toast.error('Failed to submit review')
        } finally {
            setSubmitting(false)
        }
    }

    if (done) {
        return (
            <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: EASE_OUT }}
                    className="text-center space-y-4 max-w-xs px-4"
                >
                    <div className="inline-flex w-14 h-14 rounded-full bg-emerald-500/10 items-center justify-center mb-2">
                        <Trophy className="h-7 w-7 text-emerald-500" />
                    </div>
                    <h2 className="text-lg font-semibold">All caught up</h2>
                    <p className="text-sm text-muted-foreground">
                        You've reviewed all {progress.total} pending submissions.
                    </p>
                    <div className="flex gap-2 justify-center pt-1">
                        <Button variant="outline" size="sm" onClick={loadNext} className="gap-1.5">
                            <RefreshCw className="h-3.5 w-3.5" />
                            Check again
                        </Button>
                        <Button size="sm" onClick={onClose}>Back to list</Button>
                    </div>
                </motion.div>
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: EASE_OUT }}
            className="fixed inset-0 z-50 bg-background flex flex-col"
        >
            {/* Top bar */}
            <div className="border-b border-border px-6 h-11 flex items-center gap-6 shrink-0">
                <span className="text-sm font-medium">Review mode</span>
                <ProgressBar reviewed={progress.reviewed} total={progress.total} />
                <button
                    onClick={onClose}
                    className="ml-auto p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    aria-label="Exit review mode"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
            ) : submission ? (
                <div ref={contentRef} className="flex-1 overflow-y-auto">
                    <div className="max-w-2xl mx-auto px-6 py-8">
                        {/* Talk header */}
                        <div className="mb-6">
                            <h1 className="text-xl font-semibold leading-snug mb-1">
                                {submission.title || submission.elevator_pitch}
                            </h1>
                            <p className="text-sm text-muted-foreground">{submission.submitter_email}</p>
                        </div>

                        {/* Tabs */}
                        <div className="border-b border-border mb-6">
                            <nav className="flex gap-0 -mb-px">
                                {TABS.map(tab => {
                                    const count = tab.key === 'reviews'
                                        ? (submission.reviews_detail?.length ?? 0)
                                        : null
                                    return (
                                        <button
                                            key={tab.key}
                                            onClick={() => setActiveTab(tab.key)}
                                            className={cn(
                                                'px-4 py-2 text-sm border-b-2 transition-colors duration-150',
                                                activeTab === tab.key
                                                    ? 'border-orange-500 text-foreground font-medium'
                                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                                            )}
                                        >
                                            {tab.label}
                                            {count !== null && (
                                                <span className="ml-1.5 text-xs text-muted-foreground">({count})</span>
                                            )}
                                        </button>
                                    )
                                })}
                            </nav>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15, ease: EASE_OUT }}
                            >
                                {activeTab === 'proposal' ? (
                                    <ProposalTab sub={submission} />
                                ) : (
                                    <ReviewsTab
                                        sub={submission}
                                        score={score}
                                        notes={notes}
                                        submitting={submitting}
                                        onScoreChange={setScore}
                                        onNotesChange={setNotes}
                                        onSubmit={handleSubmit}
                                        onSkip={loadNext}
                                    />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            ) : null}
        </motion.div>
    )
}
