'use client'

import { useEffect, useState, useCallback } from "react"
import {
    Pencil, Trash2, Loader2, Calendar, ExternalLink, Video,
    FileText, QrCode, Copy, Check, ToggleLeft, ToggleRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { experiencesApi, type SpeakerExperience } from "@/lib/api/experiencesApi"
import { feedbackAPI } from "@/lib/api/feedbackApi"
import { toast } from "sonner"
import { format } from "date-fns"
import { AddExperienceDialog } from "./add-experience-dialog"
import { EditExperienceDialog } from "./edit-experience-dialog"

export function ManageExperiences() {
    const [experiences, setExperiences] = useState<SpeakerExperience[]>([])
    const [loading, setLoading] = useState(true)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [editExperience, setEditExperience] = useState<SpeakerExperience | null>(null)
    const [togglingId, setTogglingId] = useState<string | null>(null)
    const [qrLoadingId, setQrLoadingId] = useState<string | null>(null)
    const [copiedSlug, setCopiedSlug] = useState<string | null>(null)

    const fetchExperiences = useCallback(async () => {
        try {
            setLoading(true)
            const data = await experiencesApi.getMyExperiences()
            setExperiences(data)
        } catch (error) {
            console.error('Error fetching experiences:', error)
            toast.error('Failed to load experiences')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchExperiences()
    }, [fetchExperiences])

    const handleDelete = async () => {
        if (!deleteId) return
        try {
            setDeleting(true)
            await experiencesApi.deleteExperience(deleteId)
            toast.success('Experience deleted successfully')
            setExperiences((prev) => prev.filter((e) => e.id !== deleteId))
            setDeleteId(null)
        } catch (error) {
            console.error('Error deleting experience:', error)
            toast.error('Failed to delete experience')
        } finally {
            setDeleting(false)
        }
    }

    const handleToggleFeedback = async (experience: SpeakerExperience) => {
        if (!experience.id || togglingId) return
        setTogglingId(experience.id)
        try {
            const updated = await experiencesApi.updateExperience(experience.id, {
                feedback_enabled: !experience.feedback_enabled,
            })
            setExperiences((prev) =>
                prev.map((e) => (e.id === experience.id ? { ...e, ...updated } : e))
            )
            toast.success(
                updated.feedback_enabled
                    ? 'Feedback collection enabled'
                    : 'Feedback collection paused'
            )
        } catch (error) {
            console.error('Error toggling feedback:', error)
            toast.error('Failed to update feedback setting')
        } finally {
            setTogglingId(null)
        }
    }

    const handleDownloadQR = async (experience: SpeakerExperience) => {
        if (!experience.feedback_slug || qrLoadingId) return
        setQrLoadingId(experience.id ?? null)
        let blobUrl: string | null = null
        try {
            blobUrl = await feedbackAPI.getQRCodeBlobUrl(experience.feedback_slug)
            const a = document.createElement('a')
            a.href = blobUrl
            a.download = `qr-${experience.feedback_slug}.png`
            a.click()
            toast.success('QR code downloaded!')
        } catch (error: any) {
            console.error('Error downloading QR code:', error)
            toast.error(error?.message || 'Failed to download QR code')
        } finally {
            if (blobUrl) URL.revokeObjectURL(blobUrl)
            setQrLoadingId(null)
        }
    }

    const handleCopyLink = (experience: SpeakerExperience) => {
        if (!experience.feedback_slug) return
        const url = `${window.location.origin}/feedback/${experience.feedback_slug}`
        navigator.clipboard.writeText(url).then(() => {
            setCopiedSlug(experience.feedback_slug!)
            toast.success('Feedback link copied to clipboard')
            setTimeout(() => setCopiedSlug(null), 2000)
        })
    }

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString)
            if (isNaN(date.getTime())) return dateString
            return format(date, 'MMM dd, yyyy')
        } catch {
            return dateString
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold">Manage Speaking Experiences</h2>
                    <p className="text-muted-foreground mt-2">
                        Showcase your past talks and collect QR-based audience feedback for each presentation.
                    </p>
                </div>
                <AddExperienceDialog onSuccess={fetchExperiences} />
            </div>

            {experiences.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No experiences yet</h3>
                        <p className="text-muted-foreground text-center mb-4 max-w-sm">
                            Start building your speaking portfolio by adding your conference talks and presentations.
                        </p>
                        <AddExperienceDialog onSuccess={fetchExperiences} />
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
                    {experiences.map((experience) => (
                        <Card key={experience.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <CardTitle className="text-xl leading-snug">{experience.topic}</CardTitle>
                                        <CardDescription className="mt-1 flex items-center gap-2">
                                            <Calendar className="h-4 w-4 flex-shrink-0" />
                                            {formatDate(experience.event_date)} · {experience.event_name}
                                        </CardDescription>
                                    </div>
                                    <div className="flex gap-1 flex-shrink-0">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setEditExperience(experience)}
                                            className="h-8 w-8"
                                            title="Edit"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setDeleteId(experience.id ?? null)}
                                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div
                                    className="text-sm line-clamp-3 prose prose-sm max-w-none dark:prose-invert prose-strong:text-foreground prose-strong:font-bold"
                                    dangerouslySetInnerHTML={{ __html: experience.description }}
                                />

                                {/* External links */}
                                {(experience.presentation_link || experience.video_recording_link) && (
                                    <div className="flex flex-wrap gap-2">
                                        {experience.presentation_link && (
                                            <Button variant="outline" size="sm" asChild className="text-xs">
                                                <a href={experience.presentation_link} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="mr-1 h-3 w-3" />
                                                    View Slides
                                                </a>
                                            </Button>
                                        )}
                                        {experience.video_recording_link && (
                                            <Button variant="outline" size="sm" asChild className="text-xs">
                                                <a href={experience.video_recording_link} target="_blank" rel="noopener noreferrer">
                                                    <Video className="mr-1 h-3 w-3" />
                                                    Watch Talk
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                )}

                                {/* ── Feedback controls ────────────────────────────────── */}
                                {experience.feedback_slug && (
                                    <div className="border-t pt-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                Audience Feedback
                                            </span>
                                            {/* Enabled / disabled badge */}
                                            <Badge
                                                variant="outline"
                                                className={
                                                    experience.feedback_enabled
                                                        ? "border-green-300 text-green-700 bg-green-50 dark:border-green-700 dark:text-green-400 dark:bg-green-900/20"
                                                        : "border-muted text-muted-foreground"
                                                }
                                            >
                                                {experience.feedback_enabled ? 'Open' : 'Paused'}
                                            </Badge>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {/* Toggle feedback on/off */}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-xs gap-1.5"
                                                disabled={togglingId === experience.id}
                                                onClick={() => handleToggleFeedback(experience)}
                                                title={
                                                    experience.feedback_enabled
                                                        ? "Pause feedback collection"
                                                        : "Enable feedback collection"
                                                }
                                            >
                                                {togglingId === experience.id ? (
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                ) : experience.feedback_enabled ? (
                                                    <ToggleRight className="h-3.5 w-3.5 text-green-500" />
                                                ) : (
                                                    <ToggleLeft className="h-3.5 w-3.5 text-muted-foreground" />
                                                )}
                                                {experience.feedback_enabled ? 'Disable' : 'Enable'}
                                            </Button>

                                            {/* Copy audience link */}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-xs gap-1.5"
                                                onClick={() => handleCopyLink(experience)}
                                                title="Copy audience feedback link"
                                            >
                                                {copiedSlug === experience.feedback_slug ? (
                                                    <Check className="h-3.5 w-3.5 text-green-500" />
                                                ) : (
                                                    <Copy className="h-3.5 w-3.5" />
                                                )}
                                                {copiedSlug === experience.feedback_slug ? 'Copied!' : 'Copy Link'}
                                            </Button>

                                            {/* Download QR code PNG */}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-xs gap-1.5"
                                                disabled={qrLoadingId === experience.id}
                                                onClick={() => handleDownloadQR(experience)}
                                                title="Download QR code for this presentation"
                                            >
                                                {qrLoadingId === experience.id ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    <QrCode className="h-3.5 w-3.5" />
                                                )}
                                                Download QR
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Delete Confirmation */}
            <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this speaking experience and its associated feedback QR code. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {deleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Edit Dialog */}
            {editExperience && (
                <EditExperienceDialog
                    experience={editExperience}
                    open={!!editExperience}
                    onOpenChange={(open) => !open && setEditExperience(null)}
                    onSuccess={() => {
                        fetchExperiences()
                        setEditExperience(null)
                    }}
                />
            )}
        </div>
    )
}
