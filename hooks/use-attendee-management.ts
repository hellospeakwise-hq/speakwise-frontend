// Attendee feature is temporarily disabled
import type { Attendee, AttendeeUpload } from '@/lib/api/attendeeApi'

export function useAttendeeManagement(_eventId: string | null) {
  return {
    attendees: [] as Attendee[],
    uploads: [] as AttendeeUpload[],
    loading: false,
    error: null as string | null,
    uploadCSV: async (_file: File) => { throw new Error('Attendees disabled') },
    refreshData: async () => {},
    loadAttendees: async () => {},
    loadUploadHistory: async () => {},
    deleteAttendee: async (_attendeeId: string) => {},
    deleteAllAttendees: async () => {},
  }
}
