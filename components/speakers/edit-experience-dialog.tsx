'use client'

import { useState, useEffect } from "react"
import { CalendarIcon, Loader2, Link as LinkIcon, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { experiencesApi, type SpeakerExperience, type CreateExperienceData } from "@/lib/api/experiencesApi"
import { toast } from "sonner"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface EditExperienceDialogProps {
    experience: SpeakerExperience
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function EditExperienceDialog({ experience, open, onOpenChange, onSuccess }: EditExperienceDialogProps) {
    const [loading, setLoading] = useState(false)
    const [date, setDate] = useState<Date>()

    const [formData, setFormData] = useState<CreateExperienceData>({
        event_name: experience.event_name,
        event_date: experience.event_date,
        topic: experience.topic,
        description: experience.description,
        presentation_link: experience.presentation_link || '',
        video_recording_link: experience.video_recording_link || '',
    })

    useEffect(() => {
        // Parse the initial date
        try {
            const initialDate = new Date(experience.event_date)
            if (!isNaN(initialDate.getTime())) {
                setDate(initialDate)
            }
        } catch (error) {
            console.error('Error parsing date:', error)
        }
    }, [experience.event_date])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.event_name || !formData.event_date || !formData.topic || !formData.description) {
            toast.error('Please fill in all required fields')
            return
        }

        try {
            setLoading(true)
            await experiencesApi.updateExperience(experience.id, formData)
            toast.success('Experience updated successfully!')
            onOpenChange(false)

            if (onSuccess) {
                onSuccess()
            }
        } catch (error) {
            console.error('Error updating experience:', error)
            toast.error('Failed to update experience. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleDateSelect = (selectedDate: Date | undefined) => {
        setDate(selectedDate)
        if (selectedDate) {
            setFormData(prev => ({
                ...prev,
                event_date: format(selectedDate, 'yyyy-MM-dd')
            }))
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Edit Speaking Experience</DialogTitle>
                    <DialogDescription>
                        Update your conference talk or presentation details
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 py-4">
                        {/* Event Name */}
                        <div className="space-y-2">
                            <Label htmlFor="event_name" className="text-sm font-medium">
                                Event/Conference Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="event_name"
                                placeholder="e.g., PyCon Ghana 2025"
                                value={formData.event_name}
                                onChange={(e) => setFormData(prev => ({ ...prev, event_name: e.target.value }))}
                                className="w-full"
                                required
                            />
                        </div>

                        {/* Event Date */}
                        <div className="space-y-2">
                            <Label htmlFor="event_date" className="text-sm font-medium">
                                Event Date <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="event_date"
                                type="date"
                                value={formData.event_date}
                                onChange={(e) => {
                                    setFormData(prev => ({ ...prev, event_date: e.target.value }))
                                    if (e.target.value) {
                                        setDate(new Date(e.target.value))
                                    }
                                }}
                                className="w-full"
                                required
                            />
                        </div>

                        {/* Topic */}
                        <div className="space-y-2">
                            <Label htmlFor="topic" className="text-sm font-medium">
                                Talk Topic/Title <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="topic"
                                placeholder="e.g., Building Scalable APIs with Python"
                                value={formData.topic}
                                onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                                className="w-full"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-sm font-medium">
                                Description <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                id="description"
                                placeholder="Describe what you talked about, key takeaways, and audience size..."
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full min-h-[100px]"
                                required
                            />
                        </div>

                        {/* Presentation Link */}
                        <div className="space-y-2">
                            <Label htmlFor="presentation_link" className="text-sm font-medium">
                                Presentation Link (Optional)
                            </Label>
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="presentation_link"
                                    type="url"
                                    placeholder="https://slides.com/your-presentation"
                                    value={formData.presentation_link}
                                    onChange={(e) => setFormData(prev => ({ ...prev, presentation_link: e.target.value }))}
                                    className="w-full pl-9"
                                />
                            </div>
                        </div>

                        {/* Video Recording Link */}
                        <div className="space-y-2">
                            <Label htmlFor="video_recording_link" className="text-sm font-medium">
                                Video Recording Link (Optional)
                            </Label>
                            <div className="relative">
                                <Video className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="video_recording_link"
                                    type="url"
                                    placeholder="https://youtube.com/watch?v=..."
                                    value={formData.video_recording_link}
                                    onChange={(e) => setFormData(prev => ({ ...prev, video_recording_link: e.target.value }))}
                                    className="w-full pl-9"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update Experience'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
