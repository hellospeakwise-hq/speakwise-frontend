'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Clock, Loader2, FileText, ChevronDown, ChevronUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cfpApi, type CFPSubmission, TALK_TYPE_LABELS, AUDIENCE_LABELS, CFP_CATEGORIES } from '@/lib/api/cfpApi'
import { toast } from 'sonner'

interface CFPSubmissionsListProps {
    eventSlug: string
}

const STATUS_CONFIG = {
    pending:  { label: 'Pending',  icon: Clock,       class: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
    accepted: { label: 'Accepted', icon: CheckCircle, class: 'bg-green-500/10 text-green-500 border-green-500/20' },
    rejected: { label: 'Rejected', icon: XCircle,     class: 'bg-red-500/10 text-red-500 border-red-500/20' },
}

export function CFPSubmissionsList({ eventSlug }: CFPSubmissionsListProps) {
    const [submissions, setSubmissions] = useState<CFPSubmission[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [updatingId, setUpdatingId] = useState<string | null>(null)

    useEffect(() => {
        cfpApi.listCFPs(eventSlug)
            .then(setSubmissions)
            .catch(() => toast.error('Failed to load CFP submissions'))
            .finally(() => setLoading(false))
    }, [eventSlug])

    const handleStatusUpdate = async (id: string, status: 'accepted' | 'rejected') => {
        try {
            setUpdatingId(id)
            const updated = await cfpApi.updateStatus(id, status)
            setSubmissions(prev => prev.map(s => s.id === id ? updated : s))
            toast.success(`Submission ${status}`)
        } catch {
            toast.error(`Failed to ${status} submission`)
        } finally {
            setUpdatingId(null)
        }
    }

    const getCategoryLabel = (value: string) =>
        CFP_CATEGORIES.find(c => c.value === value)?.label ?? value

    if (loading) {
        return (
            <div className="flex items-center justify-center h-40">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (submissions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3 text-muted-foreground">
                <FileText className="h-10 w-10 opacity-30" />
                <p className="font-medium">No CFP submissions yet</p>
                <p className="text-sm">Submissions will appear here once speakers apply.</p>
            </div>
        )
    }

    const pending = submissions.filter(s => s.status === 'pending')
    const reviewed = submissions.filter(s => s.status !== 'pending')

    const renderCard = (sub: CFPSubmission) => {
        const status = STATUS_CONFIG[sub.status]
        const StatusIcon = status.icon
        const isExpanded = expandedId === sub.id
        const isUpdating = updatingId === sub.id

        return (
            <Card key={sub.id} className="border">
                <CardContent className="p-5 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0 space-y-1">
                            <p className="font-semibold">{sub.elevator_pitch}</p>
                            <p className="text-sm text-muted-foreground">
                                {sub.submitter_email} · {getCategoryLabel(sub.category)}
                            </p>
                        </div>
                        <Badge variant="outline" className={`shrink-0 flex items-center gap-1 ${status.class}`}>
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                        </Badge>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="bg-muted px-2 py-0.5 rounded-full">{TALK_TYPE_LABELS[sub.talk_type]}</span>
                        <span className="bg-muted px-2 py-0.5 rounded-full">{AUDIENCE_LABELS[sub.audience]}</span>
                    </div>

                    {/* Expand toggle */}
                    <button
                        onClick={() => setExpandedId(isExpanded ? null : sub.id)}
                        className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600"
                    >
                        {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        {isExpanded ? 'Show less' : 'Read full abstract'}
                    </button>

                    {isExpanded && (
                        <div className="space-y-3 pt-1 border-t text-sm">
                            <div>
                                <p className="font-medium mb-1">Abstract</p>
                                <p className="text-muted-foreground whitespace-pre-wrap">{sub.abstract}</p>
                            </div>
                            {sub.other_speakers_text && (
                                <div>
                                    <p className="font-medium mb-1">Co-speakers (external)</p>
                                    <p className="text-muted-foreground">{sub.other_speakers_text}</p>
                                </div>
                            )}
                            {sub.other_comments && (
                                <div>
                                    <p className="font-medium mb-1">Additional Comments</p>
                                    <p className="text-muted-foreground">{sub.other_comments}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Actions — only for pending */}
                    {sub.status === 'pending' && (
                        <div className="flex gap-2 justify-end pt-1">
                            <Button
                                size="sm"
                                variant="outline"
                                className="text-red-500 border-red-500/30 hover:bg-red-500/10 hover:text-red-600"
                                disabled={isUpdating}
                                onClick={() => handleStatusUpdate(sub.id, 'rejected')}
                            >
                                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <><XCircle className="h-4 w-4 mr-1" />Reject</>}
                            </Button>
                            <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                disabled={isUpdating}
                                onClick={() => handleStatusUpdate(sub.id, 'accepted')}
                            >
                                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle className="h-4 w-4 mr-1" />Accept</>}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    {submissions.length} submission{submissions.length !== 1 ? 's' : ''} ·{' '}
                    {pending.length} pending
                </p>
            </div>

            {pending.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Pending Review ({pending.length})
                    </h3>
                    {pending.map(renderCard)}
                </div>
            )}

            {reviewed.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Reviewed ({reviewed.length})
                    </h3>
                    {reviewed.map(renderCard)}
                </div>
            )}
        </div>
    )
}
