// Attendee feature is temporarily disabled (backend removed attendee endpoints)

export interface Attendee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  organization?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface AttendanceEmail {
  id: string;
  email: string;
  event: string;
  is_given_feedback: boolean;
  created_at: string;
}

export interface AttendeeUpload {
  id: string;
  event: string;
  organizer: string;
  csv_file: string;
  uploaded_at: string;
  processed: boolean;
  processed_at: string | null;
  success_count: number;
  error_count: number;
  error_log: string;
}

export interface UploadStatus {
  total: number;
  successful: number;
  failed: number;
  errors: string[];
}

export const attendeeAPI = {
  async getAttendanceEmailsByEvent(_eventId: string): Promise<AttendanceEmail[]> { return [] },
  async getAttendeesByEvent(_eventId: string): Promise<Attendee[]> { return [] },
  async uploadAttendeesCSV(_eventId: string, _csvFile: File): Promise<any> { throw new Error('Attendees disabled') },
  async getUploadHistory(_eventId: string): Promise<AttendeeUpload[]> { return [] },
  async getUploadStatus(_uploadId: string): Promise<UploadStatus> { throw new Error('Attendees disabled') },
  async deleteAttendee(_attendeeId: string, _eventId: string): Promise<void> {},
  async deleteAllAttendees(_eventId: string): Promise<void> {},
};
