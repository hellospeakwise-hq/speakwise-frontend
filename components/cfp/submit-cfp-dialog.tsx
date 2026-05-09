'use client'

import { useState } from 'react'
import { Loader2, Send } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/auth-context'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { cfpApi, CFP_CATEGORIES, type CreateCFPData } from '@/lib/api/cfpApi'
import { toast } from 'sonner'

interface SubmitCFPDialogProps {
    eventSlug: string
    eventTitle: string
    onSuccess?: () => void
}

const EMPTY_FORM: CreateCFPData = {
    talk_type: 'short',
    audience: 'all',
    category: '',
    elevator_pitch: '',
    abstract: '',
    other_speakers_text: '',
    other_comments: '',
}

export function SubmitCFPDialog({ eventSlug, eventTitle, onSuccess }: SubmitCFPDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState<CreateCFPData>(EMPTY_FORM)
    const { isAuthenticated } = useAuth()
    const router = useRouter()

    const handleTriggerClick = () => {
        if (!isAuthenticated) {
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('redirectAfterLogin', window.location.pathname)
            }
            router.push('/signin')
            return
        }
        setOpen(true)
    }

    const set = (field: keyof CreateCFPData, value: string) =>
        setForm(prev => ({ ...prev, [field]: value }))

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.category) {
            toast.error('Please select a category')
            return
        }
        try {
            setLoading(true)
            const result = await cfpApi.submitCFP(eventSlug, form)
            // persist to localStorage so the speaker dashboard can show it
            if (typeof window !== 'undefined') {
                const existing = JSON.parse(localStorage.getItem('cfp_submissions') || '[]')
                const updated = [result, ...existing.filter((s: any) => s.id !== result.id)]
                localStorage.setItem('cfp_submissions', JSON.stringify(updated))
            }
            toast.success('CFP submitted successfully!')
            setOpen(false)
            setForm(EMPTY_FORM)
            onSuccess?.()
        } catch (err: any) {
            toast.error(err?.message || 'Failed to submit CFP')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Button
                onClick={handleTriggerClick}
                className="rounded-full bg-orange-500 hover:bg-orange-600 text-white px-5"
            >
                <Send className="h-4 w-4 mr-2" />
                Submit CFP
            </Button>

            <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl">Submit a Talk Proposal</DialogTitle>
                    <DialogDescription>
                        Submitting to <span className="font-medium text-foreground">{eventTitle}</span>
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-5 py-4">

                        {/* Talk Type + Audience Level */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Talk Type <span className="text-red-500">*</span></Label>
                                <Select value={form.talk_type} onValueChange={v => set('talk_type', v as any)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="short">Short Talk</SelectItem>
                                        <SelectItem value="demo">Demo</SelectItem>
                                        <SelectItem value="long">Long Talk</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Audience Level <span className="text-red-500">*</span></Label>
                                <Select value={form.audience} onValueChange={v => set('audience', v as any)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="beginner">Beginner</SelectItem>
                                        <SelectItem value="intermediate">Intermediate</SelectItem>
                                        <SelectItem value="advanced">Advanced</SelectItem>
                                        <SelectItem value="all">All Levels</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <Label>Category <span className="text-red-500">*</span></Label>
                            <Select value={form.category} onValueChange={v => set('category', v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CFP_CATEGORIES.map(c => (
                                        <SelectItem key={c.value} value={c.value}>
                                            {c.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Elevator Pitch */}
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label>Elevator Pitch <span className="text-red-500">*</span></Label>
                                <span className="text-xs text-muted-foreground">{form.elevator_pitch.length}/300</span>
                            </div>
                            <Input
                                placeholder="A short summary of your talk (max 300 characters)"
                                maxLength={300}
                                value={form.elevator_pitch}
                                onChange={e => set('elevator_pitch', e.target.value)}
                                required
                            />
                        </div>

                        {/* Abstract */}
                        <div className="space-y-2">
                            <Label>Abstract <span className="text-red-500">*</span></Label>
                            <Textarea
                                placeholder="Full description of your talk — what will attendees learn? What's the structure?"
                                rows={5}
                                value={form.abstract}
                                onChange={e => set('abstract', e.target.value)}
                                required
                            />
                        </div>

                        {/* Co-speakers (free text) */}
                        <div className="space-y-2">
                            <Label>Co-speakers not on SpeakWise <span className="text-xs text-muted-foreground">(optional)</span></Label>
                            <Input
                                placeholder="Names / emails of co-presenters not yet on SpeakWise"
                                value={form.other_speakers_text}
                                onChange={e => set('other_speakers_text', e.target.value)}
                            />
                        </div>

                        {/* Other comments */}
                        <div className="space-y-2">
                            <Label>Additional Comments <span className="text-xs text-muted-foreground">(optional)</span></Label>
                            <Textarea
                                placeholder="Anything else you'd like the organizers to know"
                                rows={3}
                                value={form.other_comments}
                                onChange={e => set('other_comments', e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700 text-white">
                            {loading ? (
                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</>
                            ) : (
                                <><Send className="h-4 w-4 mr-2" />Submit Proposal</>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
