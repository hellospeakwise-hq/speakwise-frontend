'use client'

import { useEffect, useState } from "react"
import { Pencil, Trash2, Loader2, Calendar, ExternalLink, Video, FileText } from "lucide-react"
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
import { experiencesApi, type SpeakerExperience } from "@/lib/api/experiencesApi"
import { toast } from "sonner"
import { format } from "date-fns"
import { AddExperienceDialog } from "./add-experience-dialog"
import { EditExperienceDialog } from "./edit-experience-dialog"

export function ManageExperiences() {
    const [experiences, setExperiences] = useState<SpeakerExperience[]>([])
    const [loading, setLoading] = useState(true)
    const [deleteId, setDeleteId] = useState<number | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [editExperience, setEditExperience] = useState<SpeakerExperience | null>(null)

    const fetchExperiences = async () => {
        try {
            setLoading(true)
            console.log('🔄 Fetching experiences...')
            const data = await experiencesApi.getMyExperiences()
            console.log('✅ Received experiences:', data)
            console.log('📊 Number of experiences:', data.length)
            setExperiences(data)
        } catch (error) {
            console.error('❌ Error fetching experiences:', error)
            toast.error('Failed to load experiences')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchExperiences()
    }, [])

    const handleDelete = async () => {
        if (!deleteId) return

        try {
            setDeleting(true)
            await experiencesApi.deleteExperience(deleteId)
            toast.success('Experience deleted successfully')
            setExperiences(experiences.filter(exp => exp.id !== deleteId))
            setDeleteId(null)
        } catch (error) {
            console.error('Error deleting experience:', error)
            toast.error('Failed to delete experience')
        } finally {
            setDeleting(false)
        }
    }

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString)
            if (isNaN(date.getTime())) {
                return dateString
            }
            return format(date, 'MMM dd, yyyy')
        } catch (error) {
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
                        Let's others learn from your expertise by showcasing your past talks and presentations, helping you build credibility as a speaker.
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
                            Start building your speaking portfolio by adding your conference talks and presentations
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
                                    <div className="flex-1">
                                        <CardTitle className="text-xl">{experience.topic}</CardTitle>
                                        <CardDescription className="mt-1 flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            {formatDate(experience.event_date)} • {experience.event_name}
                                        </CardDescription>
                                    </div>
                                    <div className="flex gap-1 flex-shrink-0">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setEditExperience(experience)}
                                            className="h-8 w-8"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setDeleteId(experience.id)}
                                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
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

                                {(experience.presentation_link || experience.video_recording_link) && (
                                    <div className="flex flex-wrap gap-2">
                                        {experience.presentation_link && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                                className="text-xs"
                                            >
                                                <a
                                                    href={experience.presentation_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <ExternalLink className="mr-1 h-3 w-3" />
                                                    View Slides
                                                </a>
                                            </Button>
                                        )}
                                        {experience.video_recording_link && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                                className="text-xs"
                                            >
                                                <a
                                                    href={experience.video_recording_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <Video className="mr-1 h-3 w-3" />
                                                    Watch Talk
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this speaking experience. This action cannot be undone.
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
                            ) : (
                                'Delete'
                            )}
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
