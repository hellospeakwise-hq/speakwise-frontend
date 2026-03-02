'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import {
    Mic, Globe, Lock, Eye, EyeOff, Trash2, QrCode,
    Star, MessageSquare, RefreshCw, Plus, Copy, Check,
    Loader2, X, ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { talksApi, TALK_CATEGORIES, type Talk, type TalkReview, type CreateTalkData } from '@/lib/api/talksApi'
import { RichTextEditor } from '@/components/ui/rich-text-editor'

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Strip HTML tags for plain-text previews (e.g., card descriptions). */
function stripHtml(html: string): string {
    if (!html) return ''
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function avgRating(reviews: TalkReview[]): string {
    if (!reviews.length) return '–'
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    return avg.toFixed(1)
}

function StarRow({ rating }: { rating: number }) {
    return (
        <span className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
                <Star
                    key={n}
                    className={`h-3.5 w-3.5 ${n <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`}
                />
            ))}
        </span>
    )
}

function CopyableLink({ url }: { url: string }) {
    const [copied, setCopied] = useState(false)
    const copy = () => {
        navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }
    return (
        <div className="flex items-center gap-2 bg-muted rounded-md px-3 py-2 text-sm">
            <span className="flex-1 truncate text-muted-foreground font-mono text-xs">{url}</span>
            <button onClick={copy} className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors">
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </button>
        </div>
    )
}

// ─── Add Talk dialog ──────────────────────────────────────────────────────────

const EMPTY_FORM: CreateTalkData = {
    title: '',
    description: '',
    duration: 30,
    category: '',
    is_public: false,
    is_reviewable: true,
}

function AddTalkDialog({ open, onClose, onCreated }: {
    open: boolean
    onClose: () => void
    onCreated: (talk: Talk) => void
}) {
    const [form, setForm] = useState<CreateTalkData>(EMPTY_FORM)
    const [saving, setSaving] = useState(false)
    const [errors, setErrors] = useState<Partial<Record<keyof CreateTalkData, string>>>({})

    const set = (field: keyof CreateTalkData, value: any) => {
        setForm((f) => ({ ...f, [field]: value }))
        setErrors((e) => ({ ...e, [field]: '' }))
    }

    const validate = () => {
        const e: typeof errors = {}
        if (!form.title.trim()) e.title = 'Title is required'
        if (!form.description.trim()) e.description = 'Description is required'
        if (!form.category) e.category = 'Please select a category'
        if (!form.duration || form.duration < 1) e.duration = 'Enter a valid duration'
        return e
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const errs = validate()
        if (Object.keys(errs).length) { setErrors(errs); return }

        setSaving(true)
        try {
            const talk = await talksApi.createTalk(form)
            toast.success('Talk submitted! 🎤')
            onCreated(talk)
            setForm(EMPTY_FORM)
            onClose()
        } catch (err: any) {
            toast.error(err.message || 'Could not submit talk')
        } finally {
            setSaving(false)
        }
    }

    const reset = () => { setForm(EMPTY_FORM); setErrors({}) }

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); onClose() } }}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Mic className="h-5 w-5 text-orange-500" />
                        Submit a Talk
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground pt-1">
                        Post your talk for peer feedback  no event required. Share the review link and collect ratings from anyone.
                    </p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    {/* Title */}
                    <div className="space-y-1.5">
                        <Label htmlFor="talk-title">Talk Title <span className="text-destructive">*</span></Label>
                        <Input
                            id="talk-title"
                            placeholder="e.g. Building Resilient APIs with Django"
                            value={form.title}
                            onChange={(e) => set('title', e.target.value)}
                            className={errors.title ? 'border-destructive' : ''}
                        />
                        {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
                    </div>

                    {/* Description — rich text */}
                    <div className="space-y-1.5">
                        <Label>Description <span className="text-destructive">*</span></Label>
                        <RichTextEditor
                            value={form.description}
                            onChange={(html) => set('description', html)}
                            placeholder="What is this talk about? Key topics, audience takeaways…"
                            minHeight="130px"
                            className={errors.description ? 'border-destructive' : ''}
                        />
                        {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
                    </div>

                    {/* Category + Duration row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label>Category <span className="text-destructive">*</span></Label>
                            <Select value={form.category} onValueChange={(v) => set('category', v)}>
                                <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                                    <SelectValue placeholder="Select…" />
                                </SelectTrigger>
                                <SelectContent className="max-h-60">
                                    {TALK_CATEGORIES.map((c) => (
                                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="talk-duration">Duration (min) <span className="text-destructive">*</span></Label>
                            <Input
                                id="talk-duration"
                                type="number"
                                min={1}
                                max={480}
                                placeholder="30"
                                value={form.duration}
                                onChange={(e) => set('duration', Number(e.target.value))}
                                className={errors.duration ? 'border-destructive' : ''}
                            />
                            {errors.duration && <p className="text-xs text-destructive">{errors.duration}</p>}
                        </div>
                    </div>

                    {/* Visibility toggles */}
                    <div className="space-y-2 bg-muted/40 border border-border rounded-lg p-4">
                        <p className="text-sm font-medium">Visibility</p>

                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                className="mt-0.5 accent-orange-500"
                                checked={form.is_public}
                                onChange={(e) => set('is_public', e.target.checked)}
                            />
                            <div>
                                <p className="text-sm font-medium leading-none">Make public</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Visible on your speaker profile so anyone can discover it
                                </p>
                            </div>
                        </label>

                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                className="mt-0.5 accent-orange-500"
                                checked={form.is_reviewable}
                                onChange={(e) => set('is_reviewable', e.target.checked)}
                            />
                            <div>
                                <p className="text-sm font-medium leading-none">Accept reviews</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Audience can submit anonymous star ratings and comments
                                </p>
                            </div>
                        </label>
                    </div>

                    <DialogFooter className="pt-2 gap-2">
                        <Button type="button" variant="outline" onClick={() => { reset(); onClose() }}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={saving}
                            className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
                        >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                            {saving ? 'Submitting…' : 'Submit Talk'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

// ─── Review drawer ────────────────────────────────────────────────────────────

function ReviewsDrawer({ talk, open, onClose }: { talk: Talk; open: boolean; onClose: () => void }) {
    const [reviews, setReviews] = useState<TalkReview[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!open || !talk.slug) return
        setLoading(true)
        talksApi.getTalkReviews(talk.slug)
            .then(setReviews)
            .catch(() => toast.error('Could not load reviews'))
            .finally(() => setLoading(false))
    }, [open, talk.slug])

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-orange-500" />
                        Reviews — {talk.title}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : reviews.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No reviews yet share your review link to collect feedback!
                        </p>
                    ) : (
                        <>
                            <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-orange-500">{avgRating(reviews)}</p>
                                    <p className="text-xs text-muted-foreground">avg rating</p>
                                </div>
                                <div className="h-8 w-px bg-border" />
                                <div className="text-center">
                                    <p className="text-2xl font-bold">{reviews.length}</p>
                                    <p className="text-xs text-muted-foreground">responses</p>
                                </div>
                            </div>
                            {reviews.map((r) => (
                                <div key={r.id} className="p-3 bg-card border border-border rounded-lg space-y-1">
                                    <StarRow rating={r.rating} />
                                    <p className="text-sm leading-relaxed">{r.comment}</p>
                                </div>
                            ))}
                        </>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// ─── Share link modal ─────────────────────────────────────────────────────────

function ShareModal({ talk, open, onClose }: { talk: Talk; open: boolean; onClose: () => void }) {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://speak-wise.live'
    const reviewUrl = `${baseUrl}/review/${talk.slug}`
    const [copied, setCopied] = useState(false)

    const copy = () => {
        navigator.clipboard.writeText(reviewUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    // Dynamically import QRCodeSVG to avoid SSR issues
    const [QRCodeSVG, setQRCodeSVG] = useState<any>(null)
    useEffect(() => {
        if (open) {
            import('qrcode.react').then((m) => setQRCodeSVG(() => m.QRCodeSVG))
        }
    }, [open])

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base">
                        <QrCode className="h-5 w-5 text-orange-500" />
                        Share Review Link
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-5">
                    {/* QR + info side by side */}
                    <div className="flex gap-4 items-start">
                        {/* QR code */}
                        <div className="flex-shrink-0 w-36 h-36 flex items-center justify-center bg-white rounded-xl border border-border p-2">
                            {QRCodeSVG ? (
                                <QRCodeSVG value={reviewUrl} size={112} fgColor="#111" bgColor="#fff" />
                            ) : (
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            )}
                        </div>

                        {/* Right column */}
                        <div className="flex-1 min-w-0 space-y-3">
                            <div>
                                <p className="text-sm font-medium">Display on your final slide</p>
                                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                    Attendees can scan the QR code or open the link  no login required to leave a rating.
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Review URL</p>
                                <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                                    <span className="text-xs font-mono text-muted-foreground" title={reviewUrl}>
                                        {reviewUrl.length > 45 ? reviewUrl.slice(0, 45) + '…' : reviewUrl}
                                    </span>
                                    <button
                                        onClick={copy}
                                        className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {copied
                                            ? <Check className="h-4 w-4 text-green-500" />
                                            : <Copy className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tips */}
                    <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-3 space-y-1.5 text-xs text-muted-foreground">
                        <p className="flex items-center gap-2">
                            <span>🔒</span>
                            <span>The URL contains a random suffix  it can't be guessed or scraped by bots.</span>
                        </p>
                        <p className="flex items-center gap-2">
                            <span>🔁</span>
                            <span>
                                Close the review window anytime by toggling <strong className="text-foreground">Accepting reviews</strong> off on the card.
                            </span>
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Close</Button>
                    <Button
                        onClick={copy}
                        className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
                    >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copied ? 'Copied!' : 'Copy Link'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// ─── Single talk card ─────────────────────────────────────────────────────────

function TalkCard({ talk, onToggle, onDelete }: {
    talk: Talk
    onToggle: (id: number, field: 'is_public' | 'is_reviewable', value: boolean) => Promise<void>
    onDelete: (id: number) => void
}) {
    const [togglingPublic, setTogglingPublic] = useState(false)
    const [togglingReviewable, setTogglingReviewable] = useState(false)
    const [showReviews, setShowReviews] = useState(false)
    const [showShare, setShowShare] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)

    const toggle = async (field: 'is_public' | 'is_reviewable', current: boolean) => {
        const setLoading = field === 'is_public' ? setTogglingPublic : setTogglingReviewable
        setLoading(true)
        await onToggle(talk.id, field, !current)
        setLoading(false)
    }

    const categoryLabel = TALK_CATEGORIES.find((c) => c.value === talk.category)?.label ?? talk.category

    return (
        <>
            <Card className="border border-border bg-card hover:border-orange-500/40 transition-colors">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <CardTitle
                                className="text-base font-semibold leading-snug line-clamp-1"
                                title={talk.title}
                            >
                                {talk.title}
                            </CardTitle>
                            <CardDescription className="mt-1 line-clamp-2 text-xs">
                                {stripHtml(talk.description)}
                            </CardDescription>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive flex-shrink-0"
                            onClick={() => setConfirmDelete(true)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                        <Badge variant="secondary" className="text-xs capitalize">{categoryLabel}</Badge>
                        <Badge variant="outline" className="text-xs">{talk.duration} min</Badge>
                    </div>
                </CardHeader>

                <CardContent className="space-y-3">
                    {/* Toggle row */}
                    <div className="flex items-center gap-4 flex-wrap">
                        <button
                            onClick={() => toggle('is_public', talk.is_public)}
                            disabled={togglingPublic}
                            className="flex items-center gap-1.5 text-sm"
                        >
                            {togglingPublic ? (
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            ) : talk.is_public ? (
                                <Globe className="h-4 w-4 text-green-500" />
                            ) : (
                                <Lock className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className={talk.is_public ? 'text-green-500 font-medium' : 'text-muted-foreground'}>
                                {talk.is_public ? 'Public' : 'Private'}
                            </span>
                        </button>

                        <span className="text-border">·</span>

                        <button
                            onClick={() => toggle('is_reviewable', talk.is_reviewable)}
                            disabled={togglingReviewable}
                            className="flex items-center gap-1.5 text-sm"
                        >
                            {togglingReviewable ? (
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            ) : talk.is_reviewable ? (
                                <Eye className="h-4 w-4 text-blue-500" />
                            ) : (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className={talk.is_reviewable ? 'text-blue-500 font-medium' : 'text-muted-foreground'}>
                                {talk.is_reviewable ? 'Accepting reviews' : 'Closed'}
                            </span>
                        </button>
                    </div>

                    {/* Slug pill — show just the tail of the slug, not the full path */}
                    {talk.slug && (
                        <div
                            className="flex items-center gap-1.5 bg-muted rounded px-2 py-1 min-w-0"
                            title={`/review/${talk.slug}`}
                        >
                            <QrCode className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <span className="text-xs font-mono text-muted-foreground truncate">
                                {talk.slug}
                            </span>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2 pt-1">
                        <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs" onClick={() => setShowReviews(true)}>
                            <MessageSquare className="h-3.5 w-3.5" />
                            Reviews
                        </Button>
                        {talk.slug && (
                            <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs" onClick={() => setShowShare(true)}>
                                <QrCode className="h-3.5 w-3.5" />
                                Share Link
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            <ReviewsDrawer talk={talk} open={showReviews} onClose={() => setShowReviews(false)} />
            {talk.slug && <ShareModal talk={talk} open={showShare} onClose={() => setShowShare(false)} />}

            <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete "{talk.title}"?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the talk and all its reviews. This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => { setConfirmDelete(false); onDelete(talk.id) }}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

// ─── Main section ─────────────────────────────────────────────────────────────

export function MyTalksSection() {
    const [talks, setTalks] = useState<Talk[]>([])
    const [loading, setLoading] = useState(true)
    const [addOpen, setAddOpen] = useState(false)

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const data = await talksApi.getMyTalks()
            setTalks(data)
        } catch {
            toast.error('Could not load your talks')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { load() }, [load])

    const handleToggle = async (id: number, field: 'is_public' | 'is_reviewable', value: boolean) => {
        try {
            const updated = await talksApi.updateTalk(id, { [field]: value })
            setTalks((prev) => prev.map((t) => (t.id === id ? updated : t)))
            toast.success(
                field === 'is_public'
                    ? `Talk is now ${value ? 'public' : 'private'}`
                    : `Reviews ${value ? 'opened' : 'closed'}`
            )
        } catch {
            toast.error('Failed to update talk')
        }
    }

    const handleDelete = async (id: number) => {
        try {
            await talksApi.deleteTalk(id)
            setTalks((prev) => prev.filter((t) => t.id !== id))
            toast.success('Talk deleted')
        } catch {
            toast.error('Failed to delete talk')
        }
    }

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Mic className="h-5 w-5 text-orange-500" />
                        My Talks
                    </h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Post talks for peer review — share the link and collect anonymous feedback from anyone.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={load} className="gap-1.5">
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => setAddOpen(true)}
                        className="gap-1.5 bg-orange-500 hover:bg-orange-600 text-white"
                    >
                        <Plus className="h-4 w-4" />
                        Add Talk
                    </Button>
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground bg-muted/40 border border-border rounded-lg px-4 py-3">
                <span className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-green-500" /> Public — visible on your profile</span>
                <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> Private — only you</span>
                <span className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5 text-blue-500" /> Accepting reviews</span>
                <span className="flex items-center gap-1.5"><EyeOff className="h-3.5 w-3.5" /> Reviews closed</span>
            </div>

            {/* Talk grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            ) : talks.length === 0 ? (
                <div className="text-center py-14 border border-dashed border-border rounded-xl">
                    <Mic className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm font-semibold">No talks yet</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                        Submit your first talk to start collecting peer feedback and build your public portfolio.
                    </p>
                    <Button
                        size="sm"
                        className="mt-4 gap-1.5 bg-orange-500 hover:bg-orange-600 text-white"
                        onClick={() => setAddOpen(true)}
                    >
                        <Plus className="h-4 w-4" />
                        Add Your First Talk
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {talks.map((talk) => (
                        <TalkCard
                            key={talk.id}
                            talk={talk}
                            onToggle={handleToggle}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {/* Add talk dialog */}
            <AddTalkDialog
                open={addOpen}
                onClose={() => setAddOpen(false)}
                onCreated={(talk) => setTalks((prev) => [talk, ...prev])}
            />
        </div>
    )
}
