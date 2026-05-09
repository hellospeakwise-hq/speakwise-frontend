'use client'

import { useEffect, useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { MarkdownEditor } from '@/components/ui/markdown-editor'
import { eventsApi } from '@/lib/api/events'
import type { Event } from '@/lib/types/api'
import { toast } from 'sonner'

interface CFPSettingsProps {
    eventSlug: string
}

interface CFPForm {
    accepts_cfp: boolean
    cfp_open: boolean
    cfp_description: string
    cfp_open_date: string
    cfp_deadline: string
    cfp_speaker_notification_date: string
}

function toDatetimeLocal(iso: string | null): string {
    if (!iso) return ''
    return iso.slice(0, 16)
}

function toDateInput(iso: string | null): string {
    if (!iso) return ''
    return iso.slice(0, 10)
}

export function CFPSettings({ eventSlug }: CFPSettingsProps) {
    const [event, setEvent] = useState<Event | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState<CFPForm>({
        accepts_cfp: false,
        cfp_open: false,
        cfp_description: '',
        cfp_open_date: '',
        cfp_deadline: '',
        cfp_speaker_notification_date: '',
    })

    useEffect(() => {
        eventsApi.getEvent(eventSlug)
            .then(ev => {
                setEvent(ev)
                setForm({
                    accepts_cfp: ev.accepts_cfp ?? false,
                    cfp_open: ev.cfp_open ?? false,
                    cfp_description: ev.cfp_description ?? '',
                    cfp_open_date: toDatetimeLocal(ev.cfp_open_date),
                    cfp_deadline: toDatetimeLocal(ev.cfp_deadline),
                    cfp_speaker_notification_date: toDateInput(ev.cfp_speaker_notification_date),
                })
            })
            .catch(() => toast.error('Failed to load event'))
            .finally(() => setLoading(false))
    }, [eventSlug])

    const handleSave = async () => {
        try {
            setSaving(true)
            await eventsApi.updateEvent(eventSlug, {
                accepts_cfp: form.accepts_cfp,
                cfp_open: form.cfp_open,
                cfp_description: form.cfp_description,
                cfp_open_date: form.cfp_open_date || null,
                cfp_deadline: form.cfp_deadline || null,
                cfp_speaker_notification_date: form.cfp_speaker_notification_date || null,
            })
            toast.success('CFP settings saved')
        } catch (err: any) {
            toast.error(err?.message || 'Failed to save settings')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-48">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-8 max-w-2xl">
            <div>
                <h2 className="text-xl font-semibold">CFP Settings</h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Configure what speakers see when they visit your Call for Proposals page.
                </p>
            </div>

            {/* Toggles */}
            <div className="space-y-5 border rounded-xl p-5">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="font-medium">Accept CFP Submissions</p>
                        <p className="text-sm text-muted-foreground">
                            Enable to show the Submit CFP button on your event page.
                        </p>
                    </div>
                    <Switch
                        checked={form.accepts_cfp}
                        onCheckedChange={v => setForm(p => ({ ...p, accepts_cfp: v, cfp_open: v ? p.cfp_open : false }))}
                    />
                </div>

                <div className="flex items-center justify-between gap-4 pt-3 border-t">
                    <div>
                        <p className="font-medium">CFP is Open</p>
                        <p className="text-sm text-muted-foreground">
                            Allow speakers to submit proposals right now. Turn off to pause submissions without removing the CFP page.
                        </p>
                    </div>
                    <Switch
                        checked={form.cfp_open}
                        disabled={!form.accepts_cfp}
                        onCheckedChange={v => setForm(p => ({ ...p, cfp_open: v }))}
                    />
                </div>
            </div>

            {/* CFP Description — always visible */}
            <div className="space-y-2">
                <Label className="text-base font-medium">CFP Description</Label>
                <p className="text-xs text-muted-foreground">
                    Tell speakers what you're looking for — topics, formats, level of expertise, etc.
                    This is the first thing they read before submitting a proposal.
                </p>
                <MarkdownEditor
                    rows={12}
                    placeholder={`Welcome to the official Call for Proposals for ${event?.title ?? 'our event'}!\n\n## What we are looking for\n\n- **Web Development** (Django, FastAPI, Flask)\n- **Data Science & AI** (Pandas, PyTorch)\n- **Cloud & DevOps** (Docker, Kubernetes)\n\n## Session Formats\n\n- **Talk (30 mins):** Deep dive into a topic\n- **Lightning Talk (5 mins):** Quick demos or ideas\n- **Workshop (90 mins):** Hands-on sessions\n\nNew to speaking? We offer mentorship — submit early for feedback!`}
                    value={form.cfp_description}
                    onChange={v => setForm(p => ({ ...p, cfp_description: v }))}
                />
            </div>

            {/* Key Dates — always visible */}
            <div className="space-y-4">
                <h3 className="font-medium text-base">Key Dates</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>CFP Opens</Label>
                        <Input
                            type="datetime-local"
                            value={form.cfp_open_date}
                            onChange={e => setForm(p => ({ ...p, cfp_open_date: e.target.value }))}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>CFP Closes (Deadline)</Label>
                        <Input
                            type="datetime-local"
                            value={form.cfp_deadline}
                            onChange={e => setForm(p => ({ ...p, cfp_deadline: e.target.value }))}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Speaker Notifications Date</Label>
                        <Input
                            type="date"
                            value={form.cfp_speaker_notification_date}
                            onChange={e => setForm(p => ({ ...p, cfp_speaker_notification_date: e.target.value }))}
                        />
                    </div>
                </div>
            </div>

            {/* Preview link */}
            <p className="text-xs text-muted-foreground">
                Preview your CFP page:{' '}
                <a
                    href={`/events/${eventSlug}/cfp`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-500 hover:underline"
                >
                    /events/{eventSlug}/cfp
                </a>
            </p>

            <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-orange-600 hover:bg-orange-700 text-white"
            >
                {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : <><Save className="h-4 w-4 mr-2" />Save CFP Settings</>}
            </Button>
        </div>
    )
}
