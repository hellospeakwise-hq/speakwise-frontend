import { useState, useEffect } from 'react'
import { attendeeAPI, type Attendee, type AttendeeUpload } from '@/lib/api/attendeeApi'

export function useAttendeeManagement(eventId: number | null) {
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [uploads, setUploads] = useState<AttendeeUpload[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadAttendees = async () => {
    if (!eventId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const data = await attendeeAPI.getAttendeesByEvent(eventId)
      setAttendees(data)
    } catch (err) {
      console.error('Error loading attendees:', err)
      setError('Failed to load attendees')
    } finally {
      setLoading(false)
    }
  }

  const loadUploadHistory = async () => {
    if (!eventId) return
    
    try {
      const data = await attendeeAPI.getUploadHistory(eventId)
      setUploads(data)
    } catch (err) {
      console.error('Error loading upload history:', err)
    }
  }

  const uploadCSV = async (file: File) => {
    if (!eventId) throw new Error('No event selected')
    
    try {
      const upload = await attendeeAPI.uploadAttendeesCSV(eventId, file)
      await Promise.all([loadAttendees(), loadUploadHistory()])
      return upload
    } catch (err) {
      console.error('Error uploading CSV:', err)
      throw err
    }
  }

  const refreshData = async () => {
    await Promise.all([loadAttendees(), loadUploadHistory()])
  }

  useEffect(() => {
    if (eventId) {
      refreshData()
    } else {
      setAttendees([])
      setUploads([])
    }
  }, [eventId])

  return {
    attendees,
    uploads,
    loading,
    error,
    uploadCSV,
    refreshData,
    loadAttendees,
    loadUploadHistory
  }
}
