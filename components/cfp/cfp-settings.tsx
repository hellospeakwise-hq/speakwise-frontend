'use client'

import { useEffect, useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { eventsApi } from '@/lib/api/events'
import type { Event } from '@/lib/types/api'
import { toast } from 'sonner'

interface CFPSettingsProps {
    eventSlug: string
}

interface CFPForm {
    cfp_open: boolean
    cfp_link: string
    cfp_open_date: string
    cfp_deadline: string
    cfp_speaker_notification_date: string
}

function toDatetimeLocal(iso: string | null | undefined): string {
    if (!iso) return ''
    return iso.slice(0, 16)
}

function toDateInput(iso: string | null | undefined): string {
    if (!iso) return ''
    return iso.slice(0, 10)
}

export function CFPSettings({ eventSlug }: CFPSettingsProps) {
    const [event, setEvent] = useState<Event | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState<CFPForm>({
        cfp_open: false,
        cfp_link: '',
        cfp_open_date: '',
        cfp_deadline: '',
        cfp_speaker_notification_date: '',
    })

    useEffect(() => {
        eventsApi.getEvent(eventSlug)
            .then(ev => {
                setEvent(ev)
                setForm({
                    cfp_open: ev.cfp_open ?? false,
                    cfp_link: ev.cfp_link ?? '',
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
                cfp_open: form.cfp_open,
                cfp_link: form.cfp_link,
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
                    Configure your Call for Proposals for <span className="font-medium text-foreground">{event?.title}</span>.
                </p>
            </div>

            {/* CFP open toggle */}
            <div className="space-y-5 border rounded-xl p-5">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="font-medium">CFP is Open</p>
                        <p className="text-sm text-muted-foreground">
                            Allow speakers to submit proposals for this event right now.
                        </p>
                    </div>
                    <Switch
                        checked={form.cfp_open}
                        onCheckedChange={v => setForm(p => ({ ...p, cfp_open: v }))}
                    />
                </div>
            </div>

            {/* CFP Link */}
            <div className="space-y-2">
                <Label className="text-base font-medium">CFP Submission Link</Label>
                <p className="text-xs text-muted-foreground">
                    External URL where speakers submit proposals (e.g. Sessionize, Papercall).
                </p>
                <Input
                    type="url"
                    placeholder="https://sessionize.com/your-event"
                    value={form.cfp_link}
                    onChange={e => setForm(p => ({ ...p, cfp_link: e.target.value }))}
                />
            </div>

            {/* Key Dates */}
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
                className="bg-foreground text-background hover:bg-foreground/90"
            >
                {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : <><Save className="h-4 w-4 mr-2" />Save CFP Settings</>}
            </Button>
        </div>
    )
}
