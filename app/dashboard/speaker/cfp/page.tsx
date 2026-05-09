'use client'

import { useEffect, useState } from 'react'
import { FileText, Clock, CheckCircle, XCircle, Trash2, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cfpApi, type CFPSubmission, TALK_TYPE_LABELS, AUDIENCE_LABELS, CFP_CATEGORIES } from '@/lib/api/cfpApi'
import { toast } from 'sonner'

const STATUS_CONFIG = {
    pending:  { label: 'Pending',  icon: Clock,         class: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
    accepted: { label: 'Accepted', icon: CheckCircle,   class: 'bg-green-500/10 text-green-500 border-green-500/20' },
    rejected: { label: 'Rejected', icon: XCircle,       class: 'bg-red-500/10 text-red-500 border-red-500/20' },
}

export default function SpeakerCFPPage() {
    const [submissions, setSubmissions] = useState<CFPSubmission[]>([])
    const [loading, setLoading] = useState(true)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    useEffect(() => {
        try {
            const stored = JSON.parse(localStorage.getItem('cfp_submissions') || '[]')
            setSubmissions(stored)
        } catch {
            setSubmissions([])
        } finally {
            setLoading(false)
        }
    }, [])

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this CFP submission?')) return
        try {
            setDeletingId(id)
            await cfpApi.deleteCFP(id)
            setSubmissions(prev => {
                const updated = prev.filter(s => s.id !== id)
                localStorage.setItem('cfp_submissions', JSON.stringify(updated))
                return updated
            })
            toast.success('Submission deleted')
        } catch {
            toast.error('Failed to delete submission')
        } finally {
            setDeletingId(null)
        }
    }

    const getCategoryLabel = (value: string) =>
        CFP_CATEGORIES.find(c => c.value === value)?.label ?? value

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="container max-w-4xl py-8 space-y-6">
            <div>
                <h1 className="text-2xl font-bold">My CFP Submissions</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Track the status of all your Call for Papers submissions
                </p>
            </div>

            {submissions.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-3">
                        <FileText className="h-10 w-10 text-muted-foreground/40" />
                        <p className="font-medium">No submissions yet</p>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            Browse events and click <span className="font-medium text-orange-500">Submit CFP</span> on any event page to propose a talk.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {submissions.map(sub => {
                        const status = STATUS_CONFIG[sub.status]
                        const StatusIcon = status.icon
                        const isPending = sub.status === 'pending'

                        return (
                            <Card key={sub.id} className="border">
                                <CardContent className="p-5 space-y-3">
                                    {/* Header row */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="space-y-1 flex-1 min-w-0">
                                            <p className="font-semibold truncate">{sub.elevator_pitch}</p>
                                            <p className="text-sm text-muted-foreground">{getCategoryLabel(sub.category)}</p>
                                        </div>
                                        <Badge variant="outline" className={`shrink-0 flex items-center gap-1 ${status.class}`}>
                                            <StatusIcon className="h-3 w-3" />
                                            {status.label}
                                        </Badge>
                                    </div>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                        <span className="bg-muted px-2 py-0.5 rounded-full">
                                            {TALK_TYPE_LABELS[sub.talk_type]}
                                        </span>
                                        <span className="bg-muted px-2 py-0.5 rounded-full">
                                            {AUDIENCE_LABELS[sub.audience]}
                                        </span>
                                    </div>

                                    {/* Abstract preview */}
                                    <p className="text-sm text-muted-foreground line-clamp-2">{sub.abstract}</p>

                                    {/* Actions */}
                                    {isPending && (
                                        <div className="flex justify-end pt-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                                disabled={deletingId === sub.id}
                                                onClick={() => handleDelete(sub.id)}
                                            >
                                                {deletingId === sub.id
                                                    ? <Loader2 className="h-4 w-4 animate-spin" />
                                                    : <><Trash2 className="h-4 w-4 mr-1" />Withdraw</>
                                                }
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
