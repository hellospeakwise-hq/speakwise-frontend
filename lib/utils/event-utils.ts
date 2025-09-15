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
