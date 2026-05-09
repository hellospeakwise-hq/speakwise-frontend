'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { cfpApi, CFP_CATEGORIES, type CreateCFPData } from '@/lib/api/cfpApi'
import { eventsApi } from '@/lib/api/events'
import { MarkdownEditor } from '@/components/ui/markdown-editor'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'
import type { Event } from '@/lib/types/api'

const EMPTY_FORM: CreateCFPData = {
    title: '',
    talk_type: 'short',
    duration: null,
    audience: 'all',
    category: '',
    language: 'English',
    elevator_pitch: '',
    abstract: '',
    outline: '',
    slides_url: '',
    recording_url: '',
    other_speakers_text: '',
    notes_for_organizers: '',
    other_comments: '',
    is_first_time_speaker: false,
    travel_support_needed: false,
}

export default function SubmitCFPPage() {
    const { id: slug } = useParams<{ id: string }>()
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const [event, setEvent] = useState<Event | null>(null)
    const [loadingEvent, setLoadingEvent] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [form, setForm] = useState<CreateCFPData>(EMPTY_FORM)

    useEffect(() => {
        if (!isAuthenticated) {
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('redirectAfterLogin', `/events/${slug}/cfp/submit`)
            }
            router.push('/signin')
            return
        }
        eventsApi.getEvent(slug)
            .then(setEvent)
            .catch(() => router.push(`/events/${slug}/cfp`))
            .finally(() => setLoadingEvent(false))
    }, [slug, isAuthenticated, router])

    const set = (field: keyof CreateCFPData, value: string) =>
        setForm(prev => ({ ...prev, [field]: value }))

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.category) {
            toast.error('Please select a category')
            return
        }
        try {
            setSubmitting(true)
            const result = await cfpApi.submitCFP(slug, form)
            if (typeof window !== 'undefined') {
                const existing = JSON.parse(localStorage.getItem('cfp_submissions') || '[]')
                const updated = [result, ...existing.filter((s: any) => s.id !== result.id)]
                localStorage.setItem('cfp_submissions', JSON.stringify(updated))
            }
            toast.success('Proposal submitted successfully!')
            router.push(`/events/${slug}/cfp`)
        } catch (err: any) {
            toast.error(err?.message || 'Failed to submit proposal')
        } finally {
            setSubmitting(false)
        }
    }

    if (loadingEvent) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!event) return null

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-2xl mx-auto px-4 pt-6">
                <Link
                    href={`/events/${slug}/cfp`}
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to CFP page
                </Link>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Submit a Talk Proposal</h1>
                    <p className="text-muted-foreground mt-1">
                        Submitting to <span className="font-medium text-foreground">{event.title}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Title */}
                    <div className="space-y-2">
                        <Label>Talk Title <span className="text-red-500">*</span></Label>
                        <Input
                            placeholder="e.g. Building Scalable APIs with Python"
                            value={form.title}
                            onChange={e => set('title', e.target.value)}
                            required
                        />
                    </div>

                    {/* Talk Type + Duration + Audience */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Talk Type <span className="text-red-500">*</span></Label>
                            <Select value={form.talk_type} onValueChange={v => set('talk_type', v as any)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="short">Short Talk</SelectItem>
                                    <SelectItem value="demo">Demo</SelectItem>
                                    <SelectItem value="long">Long Talk</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Duration</Label>
                            <Select value={form.duration?.toString() ?? ''} onValueChange={v => setForm(p => ({ ...p, duration: v ? Number(v) : null }))}>
                                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="15">15 min</SelectItem>
                                    <SelectItem value="30">30 min</SelectItem>
                                    <SelectItem value="45">45 min</SelectItem>
                                    <SelectItem value="60">60 min</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Audience <span className="text-red-500">*</span></Label>
                            <Select value={form.audience} onValueChange={v => set('audience', v as any)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="beginner">Beginner</SelectItem>
                                    <SelectItem value="intermediate">Intermediate</SelectItem>
                                    <SelectItem value="advanced">Advanced</SelectItem>
                                    <SelectItem value="all">All Levels</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Category + Language */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Category <span className="text-red-500">*</span></Label>
                            <Select value={form.category} onValueChange={v => set('category', v)}>
                                <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                                <SelectContent>
                                    {CFP_CATEGORIES.map(c => (
                                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Language</Label>
                            <Input
                                placeholder="English"
                                value={form.language}
                                onChange={e => set('language', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Elevator Pitch */}
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Label>Elevator Pitch <span className="text-red-500">*</span></Label>
                            <span className="text-xs text-muted-foreground">{(form.elevator_pitch ?? '').length}/300</span>
                        </div>
                        <Input
                            placeholder="One sentence that sells your talk (max 300 characters)"
                            maxLength={300}
                            value={form.elevator_pitch}
                            onChange={e => set('elevator_pitch', e.target.value)}
                            required
                        />
                    </div>

                    {/* Abstract */}
                    <div className="space-y-2">
                        <Label>Abstract <span className="text-red-500">*</span></Label>
                        <MarkdownEditor
                            rows={6}
                            placeholder="Full description — what will attendees learn? What's the structure?"
                            value={form.abstract}
                            onChange={v => set('abstract', v)}
                        />
                    </div>

                    {/* Outline */}
                    <div className="space-y-2">
                        <Label>
                            Outline <span className="text-xs text-muted-foreground">(optional · private to organizers)</span>
                        </Label>
                        <MarkdownEditor
                            rows={4}
                            placeholder="Structured breakdown: intro, sections, conclusion, timing..."
                            value={form.outline ?? ''}
                            onChange={v => set('outline', v)}
                        />
                    </div>

                    {/* Slides + Recording */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Slides URL <span className="text-xs text-muted-foreground">(optional)</span></Label>
                            <Input
                                type="url"
                                placeholder="https://slides.com/..."
                                value={form.slides_url ?? ''}
                                onChange={e => set('slides_url', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Recording URL <span className="text-xs text-muted-foreground">(optional)</span></Label>
                            <Input
                                type="url"
                                placeholder="https://youtube.com/..."
                                value={form.recording_url ?? ''}
                                onChange={e => set('recording_url', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Co-speakers */}
                    <div className="space-y-2">
                        <Label>Co-speakers not on SpeakWise <span className="text-xs text-muted-foreground">(optional)</span></Label>
                        <Input
                            placeholder="Names / emails of co-presenters not yet on SpeakWise"
                            value={form.other_speakers_text}
                            onChange={e => set('other_speakers_text', e.target.value)}
                        />
                    </div>

                    {/* Notes for organizers */}
                    <div className="space-y-2">
                        <Label>
                            Notes for Organizers <span className="text-xs text-muted-foreground">(optional · private)</span>
                        </Label>
                        <MarkdownEditor
                            rows={3}
                            placeholder="Anything organizers should know (e.g. given this talk before, need AV setup)"
                            value={form.notes_for_organizers ?? ''}
                            onChange={v => set('notes_for_organizers', v)}
                        />
                    </div>

                    {/* Additional comments */}
                    <div className="space-y-2">
                        <Label>Additional Comments <span className="text-xs text-muted-foreground">(optional)</span></Label>
                        <Textarea
                            placeholder="Anything else"
                            rows={2}
                            value={form.other_comments}
                            onChange={e => set('other_comments', e.target.value)}
                        />
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="first_time"
                                checked={!!form.is_first_time_speaker}
                                onCheckedChange={v => setForm(p => ({ ...p, is_first_time_speaker: !!v }))}
                            />
                            <Label htmlFor="first_time" className="font-normal cursor-pointer">
                                This is my first time speaking at a conference
                            </Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="travel"
                                checked={!!form.travel_support_needed}
                                onCheckedChange={v => setForm(p => ({ ...p, travel_support_needed: !!v }))}
                            />
                            <Label htmlFor="travel" className="font-normal cursor-pointer">
                                I need travel or accommodation support
                            </Label>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push(`/events/${slug}/cfp`)}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white rounded-full"
                        >
                            {submitting ? (
                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</>
                            ) : (
                                <><Send className="h-4 w-4 mr-2" />Submit Proposal</>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
