'use client'

import { useEffect, useMemo, useState } from 'react'
import {
    CheckCircle, XCircle, Loader2, FileText,
    Search, ChevronRight, X, ExternalLink, SlidersHorizontal,
    Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet'
import { cfpApi, type CFPSubmission, type CFPSubmissionWithScore, type CFPReview, TALK_TYPE_LABELS, AUDIENCE_LABELS, CFP_CATEGORIES } from '@/lib/api/cfpApi'
import { MarkdownContent } from '@/components/ui/markdown-content'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface CFPSubmissionsListProps {
    eventSlug: string
}

type StatusFilter = 'all' | 'pending' | 'accepted' | 'rejected'

const STATUS_LABEL: Record<string, string> = {
    pending:  'Pending',
    accepted: 'Accepted',
    rejected: 'Rejected',
}

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
    { key: 'all',      label: 'All' },
    { key: 'pending',  label: 'Pending' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'rejected', label: 'Rejected' },
]

const getCategoryLabel = (value: string) =>
    CFP_CATEGORIES.find(c => c.value === value)?.label ?? value

function SubmissionSheet({
    sub,
    open,
    onOpenChange,
    onStatusUpdate,
    updatingId,
}: {
    sub: CFPSubmission | null
    open: boolean
    onOpenChange: (v: boolean) => void
    onStatusUpdate: (id: string, status: 'accepted' | 'rejected') => void
    updatingId: string | null
}) {
    if (!sub) return null
    const isUpdating = updatingId === sub.id

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-xl overflow-y-auto flex flex-col gap-0 p-0">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-background border-b px-6 py-4">
                    <SheetHeader className="space-y-1">
                        <SheetTitle className="text-base font-semibold leading-snug">
                            {sub.title || sub.elevator_pitch}
                        </SheetTitle>
                        <SheetDescription className="text-sm text-muted-foreground">
                            {sub.submitter_email}
                            <span className="mx-1.5 opacity-40">·</span>
                            <span className={sub.status === 'accepted' ? 'text-foreground' : ''}>
                                {STATUS_LABEL[sub.status]}
                            </span>
                        </SheetDescription>
                    </SheetHeader>
                </div>

                <div className="flex-1 px-6 py-5 space-y-6">
                    {/* Team scores */}
                    {'reviews_detail' in sub && (sub as CFPSubmissionWithScore).reviews_detail?.length > 0 && (
                        <div className="rounded-md border border-border bg-muted/30 px-4 py-3 space-y-2.5">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-medium text-muted-foreground">Team scores</span>
                                <span className="text-foreground font-semibold">
                                    {(sub as CFPSubmissionWithScore).avg_score} avg
                                    <span className="text-muted-foreground font-normal ml-1">
                                        from {(sub as CFPSubmissionWithScore).review_count} reviewer{(sub as CFPSubmissionWithScore).review_count !== 1 ? 's' : ''}
                                    </span>
                                </span>
                            </div>
                            <div className="space-y-1.5">
                                {(sub as CFPSubmissionWithScore).reviews_detail.map((r: CFPReview) => {
                                    const initials = (r.reviewer_name || r.reviewer_email)
                                        .split(/[\s@]/).filter(Boolean).slice(0, 2).map((s: string) => s[0]).join('').toUpperCase()
                                    return (
                                        <div key={r.id} className="flex items-center gap-2.5">
                                            <div className="w-5 h-5 rounded-full bg-muted border border-border flex items-center justify-center text-[9px] font-semibold text-muted-foreground shrink-0">
                                                {initials}
                                            </div>
                                            <span className="text-xs text-muted-foreground truncate flex-1">
                                                {r.reviewer_name || r.reviewer_email.split('@')[0]}
                                            </span>
                                            {r.notes && (
                                                <span className="text-[10px] text-muted-foreground/60 italic truncate max-w-[80px]" title={r.notes}>
                                                    "{r.notes.slice(0, 20)}{r.notes.length > 20 ? '…' : ''}"
                                                </span>
                                            )}
                                            <span className="text-xs font-bold text-foreground shrink-0">{r.score}/5</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Meta grid */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Category</p>
                            <p className="font-medium">{getCategoryLabel(sub.category)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Talk type</p>
                            <p className="font-medium">{TALK_TYPE_LABELS[sub.talk_type]}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Audience</p>
                            <p className="font-medium">{AUDIENCE_LABELS[sub.audience]}</p>
                        </div>
                        {sub.duration && (
                            <div>
                                <p className="text-xs text-muted-foreground mb-0.5">Duration</p>
                                <p className="font-medium">{sub.duration} min</p>
                            </div>
                        )}
                        {sub.language && (
                            <div>
                                <p className="text-xs text-muted-foreground mb-0.5">Language</p>
                                <p className="font-medium">{sub.language}</p>
                            </div>
                        )}
                    </div>

                    {/* Flags */}
                    {(sub.is_first_time_speaker || sub.travel_support_needed) && (
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                            {sub.is_first_time_speaker && <span>First-time speaker</span>}
                            {sub.travel_support_needed && <span>Needs travel support</span>}
                        </div>
                    )}

                    {/* Elevator pitch */}
                    {sub.elevator_pitch && sub.title && (
                        <div>
                            <p className="text-xs text-muted-foreground mb-2">Elevator pitch</p>
                            <p className="text-sm text-foreground/80 italic">{sub.elevator_pitch}</p>
                        </div>
                    )}

                    {/* Abstract */}
                    {sub.abstract && (
                        <div>
                            <p className="text-xs text-muted-foreground mb-2">Abstract</p>
                            <MarkdownContent content={sub.abstract} className="text-sm text-foreground/80" />
                        </div>
                    )}

                    {/* Outline */}
                    {sub.outline && (
                        <div>
                            <p className="text-xs text-muted-foreground mb-2">Outline</p>
                            <MarkdownContent content={sub.outline} className="text-sm text-foreground/80" />
                        </div>
                    )}

                    {/* Notes for organizers */}
                    {sub.notes_for_organizers && (
                        <div className="rounded-md bg-muted/40 border border-border p-3">
                            <p className="text-xs text-muted-foreground mb-1.5">Notes for organizers</p>
                            <p className="text-sm text-foreground/80">{sub.notes_for_organizers}</p>
                        </div>
                    )}

                    {/* Co-speakers */}
                    {(sub.co_speakers_detail?.length > 0 || sub.other_speakers_text) && (
                        <div>
                            <p className="text-xs text-muted-foreground mb-2">Co-speakers</p>
                            {sub.co_speakers_detail?.length > 0 && (
                                <div className="flex items-center gap-1.5 text-sm">
                                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                    {sub.co_speakers_detail.map(s => s.name).join(', ')}
                                </div>
                            )}
                            {sub.other_speakers_text && (
                                <p className="text-sm text-muted-foreground mt-1">{sub.other_speakers_text}</p>
                            )}
                        </div>
                    )}

                    {/* Links */}
                    {(sub.slides_url || sub.recording_url) && (
                        <div className="flex gap-3">
                            {sub.slides_url && (
                                <a
                                    href={sub.slides_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                                >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    Slides
                                </a>
                            )}
                            {sub.recording_url && (
                                <a
                                    href={sub.recording_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                                >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    Recording
                                </a>
                            )}
                        </div>
                    )}

                    {/* Other comments */}
                    {sub.other_comments && (
                        <div>
                            <p className="text-xs text-muted-foreground mb-2">Additional comments</p>
                            <p className="text-sm text-foreground/80">{sub.other_comments}</p>
                        </div>
                    )}
                </div>

                {/* Action footer — only for pending */}
                {sub.status === 'pending' && (
                    <div className="sticky bottom-0 border-t bg-background px-6 py-4 flex gap-3 justify-end">
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            disabled={isUpdating}
                            onClick={() => onStatusUpdate(sub.id, 'rejected')}
                        >
                            {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                            Reject
                        </Button>
                        <Button
                            size="sm"
                            className="bg-foreground text-background hover:bg-foreground/90 gap-1.5"
                            disabled={isUpdating}
                            onClick={() => onStatusUpdate(sub.id, 'accepted')}
                        >
                            {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                            Accept
                        </Button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}

function SkeletonRow() {
    return (
        <tr className="border-b border-border/50">
            {[40, 28, 20, 16, 10, 14, 5].map((w, i) => (
                <td key={i} className="px-4 py-3">
                    <div className="h-3.5 rounded bg-muted animate-pulse" style={{ width: `${w}%` }} />
                </td>
            ))}
        </tr>
    )
}

export function CFPSubmissionsList({ eventSlug }: CFPSubmissionsListProps) {
    const [submissions, setSubmissions] = useState<CFPSubmissionWithScore[]>([])
    const [loading, setLoading] = useState(true)
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const [activeStatus, setActiveStatus] = useState<StatusFilter>('all')
    const [search, setSearch] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('all')
    const [typeFilter, setTypeFilter] = useState('all')
    const [selectedSub, setSelectedSub] = useState<CFPSubmission | null>(null)
    const [sheetOpen, setSheetOpen] = useState(false)

    useEffect(() => {
        setLoading(true)
        cfpApi.listCFPs(eventSlug)
            .then(data => setSubmissions(data as CFPSubmissionWithScore[]))
            .catch(() => toast.error('Failed to load CFP submissions'))
            .finally(() => setLoading(false))
    }, [eventSlug])

    const handleStatusUpdate = async (id: string, status: 'accepted' | 'rejected') => {
        try {
            setUpdatingId(id)
            const updated = await cfpApi.updateStatus(id, status)
            setSubmissions(prev => prev.map(s => s.id === id ? { ...s, ...updated } as CFPSubmissionWithScore : s))
            if (selectedSub?.id === id) setSelectedSub(updated)
            toast.success(`Submission ${status}`)
        } catch {
            toast.error(`Failed to ${status} submission`)
        } finally {
            setUpdatingId(null)
        }
    }

    const counts = useMemo(() => ({
        all:      submissions.length,
        pending:  submissions.filter(s => s.status === 'pending').length,
        accepted: submissions.filter(s => s.status === 'accepted').length,
        rejected: submissions.filter(s => s.status === 'rejected').length,
    }), [submissions])

    const filtered = useMemo(() => {
        return submissions.filter(s => {
            if (activeStatus !== 'all' && s.status !== activeStatus) return false
            if (categoryFilter !== 'all' && s.category !== categoryFilter) return false
            if (typeFilter !== 'all' && s.talk_type !== typeFilter) return false
            if (search.trim()) {
                const q = search.toLowerCase()
                return (
                    s.title?.toLowerCase().includes(q) ||
                    s.elevator_pitch?.toLowerCase().includes(q) ||
                    s.submitter_email?.toLowerCase().includes(q)
                )
            }
            return true
        })
    }, [submissions, activeStatus, categoryFilter, typeFilter, search])

    const openSheet = (sub: CFPSubmission) => {
        setSelectedSub(sub)
        setSheetOpen(true)
    }

    const hasFilters = search || categoryFilter !== 'all' || typeFilter !== 'all'

    return (
        <div className="space-y-4">
            {/* Stats summary */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="text-foreground font-medium">{counts.all} submissions</span>
                <span>·</span>
                <span>{counts.pending} pending</span>
                <span>·</span>
                <span>{counts.accepted} accepted</span>
                <span>·</span>
                <span>{counts.rejected} rejected</span>
            </div>

            {/* Status tabs */}
            <div className="flex items-center gap-0 border-b border-border">
                {STATUS_TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveStatus(tab.key)}
                        className={cn(
                            'flex items-center gap-1.5 px-3 py-2 text-sm border-b-2 -mb-px transition-colors',
                            activeStatus === tab.key
                                ? 'border-foreground text-foreground font-medium'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        )}
                    >
                        {tab.label}
                        <span className="text-xs text-muted-foreground tabular-nums">
                            {counts[tab.key]}
                        </span>
                    </button>
                ))}
            </div>

            {/* Filter bar */}
            <div className="flex items-center gap-2 flex-wrap">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                    <Input
                        placeholder="Search by title or speaker…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-8 h-8 text-sm"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="h-8 w-auto min-w-[140px] text-sm gap-1.5">
                        <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All categories</SelectItem>
                        {CFP_CATEGORIES.map(c => (
                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="h-8 w-auto min-w-[120px] text-sm">
                        <SelectValue placeholder="Talk type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All types</SelectItem>
                        <SelectItem value="short">Short Talk</SelectItem>
                        <SelectItem value="long">Long Talk</SelectItem>
                        <SelectItem value="demo">Demo</SelectItem>
                    </SelectContent>
                </Select>

                {hasFilters && (
                    <button
                        onClick={() => { setSearch(''); setCategoryFilter('all'); setTypeFilter('all') }}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted transition-colors"
                    >
                        <X className="h-3 w-3" />
                        Clear filters
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="rounded-md border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/40">
                                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground w-[30%]">Title</th>
                                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground w-[18%]">Speaker</th>
                                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground w-[16%]">Category</th>
                                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground w-[10%]">Type</th>
                                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground w-[11%]">Score</th>
                                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground w-[10%]">Status</th>
                                <th className="px-4 py-2.5 w-[5%]" />
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                            <FileText className="h-8 w-8 opacity-30" />
                                            <p className="text-sm font-medium">
                                                {submissions.length === 0
                                                    ? 'No submissions yet'
                                                    : 'No submissions match your filters'}
                                            </p>
                                            {submissions.length === 0 && (
                                                <p className="text-xs">Submissions will appear here once speakers apply.</p>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map(sub => {
                                    const isUpdating = updatingId === sub.id

                                    return (
                                        <tr
                                            key={sub.id}
                                            onClick={() => openSheet(sub)}
                                            className="border-b border-border/60 hover:bg-muted/30 transition-colors cursor-pointer group"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="space-y-0.5">
                                                    <p className="font-medium text-foreground leading-snug line-clamp-1">
                                                        {sub.title || sub.elevator_pitch}
                                                    </p>
                                                    {sub.title && sub.elevator_pitch && (
                                                        <p className="text-xs text-muted-foreground line-clamp-1 italic">
                                                            {sub.elevator_pitch}
                                                        </p>
                                                    )}
                                                    {(sub.is_first_time_speaker || sub.travel_support_needed) && (
                                                        <div className="flex gap-2 pt-0.5 text-[10px] text-muted-foreground/70">
                                                            {sub.is_first_time_speaker && <span>1st-time</span>}
                                                            {sub.travel_support_needed && <span>travel aid</span>}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground text-xs truncate max-w-0">
                                                <span className="truncate block">{sub.submitter_email}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-xs text-muted-foreground">{getCategoryLabel(sub.category)}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-xs text-muted-foreground">
                                                    {TALK_TYPE_LABELS[sub.talk_type]}
                                                    {sub.duration ? ` · ${sub.duration}m` : ''}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {'avg_score' in sub && (sub as CFPSubmissionWithScore).avg_score !== null ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-sm font-semibold text-foreground tabular-nums">
                                                            {(sub as CFPSubmissionWithScore).avg_score}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground">
                                                            /5 · {(sub as CFPSubmissionWithScore).review_count}r
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground/40">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                                                {sub.status === 'pending' ? (
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            disabled={isUpdating}
                                                            onClick={e => { e.stopPropagation(); handleStatusUpdate(sub.id, 'rejected') }}
                                                            title="Reject"
                                                            className="p-1 rounded text-muted-foreground hover:text-red-400 transition-colors disabled:opacity-40"
                                                        >
                                                            {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                                                        </button>
                                                        <button
                                                            disabled={isUpdating}
                                                            onClick={e => { e.stopPropagation(); handleStatusUpdate(sub.id, 'accepted') }}
                                                            title="Accept"
                                                            className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
                                                        >
                                                            {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className={cn(
                                                        'text-xs',
                                                        sub.status === 'accepted' ? 'text-foreground' : 'text-muted-foreground/50'
                                                    )}>
                                                        {STATUS_LABEL[sub.status]}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Result count footer */}
                {!loading && filtered.length > 0 && (
                    <div className="px-4 py-2.5 border-t border-border/60 bg-muted/20 flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                            {filtered.length === submissions.length
                                ? `${submissions.length} submission${submissions.length !== 1 ? 's' : ''}`
                                : `${filtered.length} of ${submissions.length} submissions`}
                        </p>
                        {counts.pending > 0 && activeStatus !== 'pending' && (
                            <button
                                onClick={() => setActiveStatus('pending')}
                                className="text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors"
                            >
                                {counts.pending} awaiting review
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Submission detail sheet */}
            <SubmissionSheet
                sub={selectedSub}
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                onStatusUpdate={handleStatusUpdate}
                updatingId={updatingId}
            />
        </div>
    )
}
