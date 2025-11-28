// Helper to robustly parse date/time input from API (string or object)

// Ensures event image URL is always absolute
export function getEventImageUrl(img?: string) {
  if (!img) return undefined;
  if (img.startsWith('http')) return img;
  return `http://127.0.0.1:8000${img}`;
}
export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled'
}

export const getEventStatus = (event: {
  is_active: boolean
  start_date_time?: string
  end_date_time?: string
}): EventStatus => {
  if (!event.is_active) {
    return EventStatus.DRAFT
  }

  // For now, we'll use is_active to determine if published
  // In a real implementation, you might have a cancelled field
  return EventStatus.PUBLISHED
}

export const getEventStatusText = (status: EventStatus): string => {
  switch (status) {
    case EventStatus.DRAFT:
      return 'Draft'
    case EventStatus.PUBLISHED:
      return 'Published'
    case EventStatus.CANCELLED:
      return 'Cancelled'
    default:
      return 'Unknown'
  }
}

export const getEventStatusColor = (status: EventStatus): string => {
  switch (status) {
    case EventStatus.DRAFT:
      return 'bg-gray-100 text-gray-800'
    case EventStatus.PUBLISHED:
      return 'bg-green-100 text-green-800'
    case EventStatus.CANCELLED:
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export const isEventUpcoming = (event: { start_date_time?: string }): boolean => {
  if (!event.start_date_time) return false
  return new Date(event.start_date_time) > new Date()
}

export const isEventPast = (event: { end_date_time?: string }): boolean => {
  if (!event.end_date_time) return false
  return new Date(event.end_date_time) < new Date()
}

export const formatEventDate = (dateString?: string): string => {
  if (!dateString) return 'TBD'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export const formatEventDateRange = (startDate?: string, endDate?: string): string => {
  if (!startDate) return 'TBD'

  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : null

  if (!end || start.toDateString() === end.toDateString()) {
    return start.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return `${start.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric'
  })} - ${end.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })}`
}

export interface DateTimeInfoLike {
  date?: string
  time?: string
  datetime?: string
}

// Parse an input that might be either an ISO string or a DateTimeInfo-like object.
export const parseDateInput = (val?: string | DateTimeInfoLike | null): Date | null => {
  if (!val) return null
  const iso = typeof val === 'string' ? val : (val.datetime || val.date || '')
  if (!iso) return null
  const d = new Date(iso)
  if (!isNaN(d.getTime())) return d
  // Fallback: try YYYY-MM-DD substring
  const dd = new Date(iso.slice(0, 10))
  if (!isNaN(dd.getTime())) return dd
  return null
}

export const formatDateFromMaybe = (val?: string | DateTimeInfoLike | null): string => {
  const d = parseDateInput(val)
  if (!d) return 'TBD'
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export const formatTimeFromMaybe = (val?: string | DateTimeInfoLike | null): string => {
  if (!val) return ''
  if (typeof val !== 'string') {
    if (val.time) return val.time.slice(0, 5)
    if (val.datetime) return new Date(val.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  const d = new Date(val as string)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

