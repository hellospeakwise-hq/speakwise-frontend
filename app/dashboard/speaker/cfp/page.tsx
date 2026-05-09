'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Loader2, CheckCircle, XCircle, Clock, Pencil, ExternalLink, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cfpApi, type CFPSubmission, TALK_TYPE_LABELS } from '@/lib/api/cfpApi'
import { toast } from 'sonner'

const STATUS_CONFIG = {
    pending:  { label: 'Submitted', icon: Clock,       class: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
    accepted: { label: 'Accepted',  icon: CheckCircle, class: 'bg-green-500/10 text-green-600 border-green-500/20' },
    rejected: { label: 'Rejected',  icon: XCircle,     class: 'bg-red-500/10 text-red-500 border-red-500/20' },
}

export default function SpeakerCFPPage() {
    const [submissions, setSubmissions] = useState<CFPSubmission[]>([])
    const [loading, setLoading] = useState(true)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    useEffect(() => {
        cfpApi.myCFPs()
            .then(setSubmissions)
            .catch(() => {
                // fallback to localStorage if API fails (offline / no endpoint yet)
                try {
                    const stored = JSON.parse(localStorage.getItem('cfp_submissions') || '[]')
                    setSubmissions(stored)
                } catch {
                    setSubmissions([])
                }
            })
            .finally(() => setLoading(false))
    }, [])

    const handleDelete = async (id: string) => {
        if (!confirm('Withdraw this CFP submission? This cannot be undone.')) return
        try {
            setDeletingId(id)
            await cfpApi.deleteCFP(id)
            setSubmissions(prev => {
                const updated = prev.filter(s => s.id !== id)
                // also clean localStorage
                try { localStorage.setItem('cfp_submissions', JSON.stringify(updated)) } catch {}
                return updated
            })
            toast.success('Submission withdrawn')
        } catch (err: any) {
            toast.error(err?.message || 'Failed to withdraw submission')
        } finally {
            setDeletingId(null)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="container max-w-4xl py-10 space-y-6">
            <div>
                <h1 className="text-2xl font-bold">My Proposals</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    All your Call for Papers submissions across events
                </p>
            </div>

            {submissions.length === 0 ? (
                <div className="border rounded-xl py-16 text-center space-y-3">
                    <p className="font-medium text-muted-foreground">No proposals yet</p>
                    <p className="text-sm text-muted-foreground">
                        Browse events and submit a talk proposal to get started.
                    </p>
                    <Button asChild className="mt-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full">
                        <Link href="/events">Browse Events</Link>
                    </Button>
                </div>
            ) : (
                <div className="border rounded-xl overflow-hidden">
                    {/* Table header */}
                    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-5 py-3 bg-muted/40 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        <span>Title</span>
                        <span>State</span>
                        <span className="w-16 text-right">Actions</span>
                    </div>

                    {/* Rows */}
                    <div className="divide-y">
                        {submissions.map(sub => {
                            const status = STATUS_CONFIG[sub.status]
                            const StatusIcon = status.icon
                            const isPending = sub.status === 'pending'
                            const isDeleting = deletingId === sub.id

                            return (
                                <div
                                    key={sub.id}
                                    className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors"
                                >
                                    {/* Title + meta */}
                                    <div className="min-w-0 space-y-0.5">
                                        <p className="font-medium truncate">
                                            {sub.title || sub.elevator_pitch}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {sub.event_title || 'Unknown event'}
                                            {sub.talk_type && (
                                                <span className="ml-2 opacity-70">· {TALK_TYPE_LABELS[sub.talk_type]}</span>
                                            )}
                                        </p>
                                    </div>

                                    {/* Status badge */}
                                    <Badge
                                        variant="outline"
                                        className={`flex items-center gap-1 shrink-0 ${status.class}`}
                                    >
                                        <StatusIcon className="h-3 w-3" />
                                        {status.label}
                                    </Badge>

                                    {/* Action buttons */}
                                    <div className="flex items-center gap-1 shrink-0">
                                        {/* View CFP page */}
                                        {sub.event_slug && (
                                            <Link href={`/events/${sub.event_slug}/cfp`} target="_blank">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                    title="View CFP page"
                                                >
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                </Button>
                                            </Link>
                                        )}

                                        {/* Edit — only for pending */}
                                        {isPending && (
                                            <Link href={`/dashboard/speaker/cfp/${sub.id}/edit`}>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                    title="Edit proposal"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                            </Link>
                                        )}

                                        {/* Withdraw — only for pending */}
                                        {isPending && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                                disabled={isDeleting}
                                                title="Withdraw proposal"
                                                onClick={() => handleDelete(sub.id)}
                                            >
                                                {isDeleting
                                                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    : <Trash2 className="h-3.5 w-3.5" />
                                                }
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Submit new proposal */}
            <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white rounded-full">
                <Link href="/events">
                    <Plus className="h-4 w-4 mr-2" />
                    Submit a new proposal
                </Link>
            </Button>
        </div>
    )
}
