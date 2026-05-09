'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
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
import { cfpApi, CFP_CATEGORIES, type CreateCFPData, type CFPSubmission } from '@/lib/api/cfpApi'
import { MarkdownEditor } from '@/components/ui/markdown-editor'
import { toast } from 'sonner'

export default function EditCFPPage() {
    const { id } = useParams<{ id: string }>()
    const router = useRouter()
    const [submission, setSubmission] = useState<CFPSubmission | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState<CreateCFPData | null>(null)

    useEffect(() => {
        cfpApi.getCFP(id)
            .then(sub => {
                if (sub.status !== 'pending') {
                    toast.error('Only pending submissions can be edited.')
                    router.push('/dashboard/speaker/cfp')
                    return
                }
                setSubmission(sub)
                setForm({
                    title: sub.title,
                    talk_type: sub.talk_type,
                    duration: sub.duration,
                    audience: sub.audience,
                    category: sub.category,
                    language: sub.language,
                    elevator_pitch: sub.elevator_pitch,
                    abstract: sub.abstract,
                    outline: sub.outline,
                    slides_url: sub.slides_url ?? '',
                    recording_url: sub.recording_url ?? '',
                    other_speakers_text: sub.other_speakers_text,
                    notes_for_organizers: sub.notes_for_organizers,
                    other_comments: sub.other_comments,
                    is_first_time_speaker: sub.is_first_time_speaker,
                    travel_support_needed: sub.travel_support_needed,
                })
            })
            .catch(() => {
                toast.error('Could not load submission')
                router.push('/dashboard/speaker/cfp')
            })
            .finally(() => setLoading(false))
    }, [id, router])

    const set = (field: keyof CreateCFPData, value: string) =>
        setForm(prev => prev ? { ...prev, [field]: value } : prev)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form) return
        if (!form.category) { toast.error('Please select a category'); return }
        try {
            setSaving(true)
            const updated = await cfpApi.updateCFP(id, form)
            // update localStorage too
            try {
                const stored = JSON.parse(localStorage.getItem('cfp_submissions') || '[]')
                localStorage.setItem('cfp_submissions', JSON.stringify(
                    stored.map((s: any) => s.id === id ? updated : s)
                ))
            } catch {}
            toast.success('Proposal updated!')
            router.push('/dashboard/speaker/cfp')
        } catch (err: any) {
            toast.error(err?.message || 'Failed to update proposal')
        } finally {
            setSaving(false)
        }
    }

    if (loading || !form) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-2xl mx-auto px-4 pt-6">
                <Link
                    href="/dashboard/speaker/cfp"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to my proposals
                </Link>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Edit Proposal</h1>
                    {submission?.event_title && (
                        <p className="text-muted-foreground mt-1">
                            Submitted to <span className="font-medium text-foreground">{submission.event_title}</span>
                        </p>
                    )}
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
                            <Select value={form.duration?.toString() ?? ''} onValueChange={v => setForm(p => p ? { ...p, duration: v ? Number(v) : null } : p)}>
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
                            placeholder="Anything organizers should know"
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
                                onCheckedChange={v => setForm(p => p ? { ...p, is_first_time_speaker: !!v } : p)}
                            />
                            <Label htmlFor="first_time" className="font-normal cursor-pointer">
                                This is my first time speaking at a conference
                            </Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="travel"
                                checked={!!form.travel_support_needed}
                                onCheckedChange={v => setForm(p => p ? { ...p, travel_support_needed: !!v } : p)}
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
                            onClick={() => router.push('/dashboard/speaker/cfp')}
                            disabled={saving}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={saving}
                            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white rounded-full"
                        >
                            {saving
                                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
                                : <><Save className="h-4 w-4 mr-2" />Save Changes</>
                            }
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
