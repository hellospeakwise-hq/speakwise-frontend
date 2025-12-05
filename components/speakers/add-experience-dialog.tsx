'use client'

import { useState } from "react"
import { CalendarIcon, Loader2, Plus, Link as LinkIcon, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { experiencesApi, type CreateExperienceData } from "@/lib/api/experiencesApi"
import { toast } from "sonner"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface AddExperienceDialogProps {
    onSuccess?: () => void
}

export function AddExperienceDialog({ onSuccess }: AddExperienceDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [date, setDate] = useState<Date>()

    const [formData, setFormData] = useState<CreateExperienceData>({
        event_name: '',
        event_date: '',
        topic: '',
        description: '',
        presentation_link: '',
        video_recording_link: '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.event_name || !formData.event_date || !formData.topic || !formData.description) {
            toast.error('Please fill in all required fields')
            return
        }

        try {
            setLoading(true)
            await experiencesApi.createExperience(formData)
            toast.success('Talk/Conference experience added successfully!')
            setOpen(false)

            // Reset form
            setFormData({
                event_name: '',
                event_date: '',
                topic: '',
                description: '',
                presentation_link: '',
                video_recording_link: '',
            })
            setDate(undefined)

            if (onSuccess) {
                onSuccess()
            }
        } catch (error) {
            console.error('Error adding experience:', error)
            toast.error('Failed to add experience. Please try again.')
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
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Talk/Conference Experience
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Add Speaking Experience</DialogTitle>
                    <DialogDescription>
                        Share your conference talks and presentations with the community
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
                            <RichTextEditor
                                content={formData.description}
                                onChange={(content) => setFormData(prev => ({ ...prev, description: content }))}
                                placeholder="Describe what you talked about, key takeaways, audience size, and any notable moments..."
                                className="w-full"
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
                            onClick={() => setOpen(false)}
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
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Experience
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
