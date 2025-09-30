import { apiClient } from './base';

export interface Attendee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  organization?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface AttendanceEmail {
  id: number;
  email: string;
  event: number;
  is_given_feedback: boolean;
  created_at: string;
}

export interface AttendeeUpload {
  id: number;
  event: number;
  organizer: number;
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

// Attendee API service
export const attendeeAPI = {
  /**
   * Get all attendance emails for an event
   */
  async getAttendanceEmailsByEvent(eventId: number): Promise<AttendanceEmail[]> {
    try {
      const response = await apiClient.get(`/organizers/attendance-list/`);
      
      // Filter by event ID if needed
      if (Array.isArray(response.data)) {
        return response.data.filter((item: AttendanceEmail) => item.event === eventId);
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching attendance emails:', error);
      throw error;
    }
  },

  /**
   * Get all attendees for an event
   */
  async getAttendeesByEvent(eventId: number): Promise<Attendee[]> {
    try {
      // Try to get actual attendees first, fallback to attendance emails
      try {
        const response = await apiClient.get(`/events/${eventId}/attendees/`);
        return response.data;
      } catch {
        // Fallback: convert attendance emails to attendee format
        const attendanceEmails = await this.getAttendanceEmailsByEvent(eventId);
        
        return attendanceEmails.map((email) => {
          const emailParts = email.email.split('@')[0];
          const nameParts = emailParts.split(/[._-]/);
          
          return {
            id: email.id,
            first_name: nameParts[0] || 'Unknown',
            last_name: nameParts[1] || '',
            email: email.email,
            organization: '',
            is_verified: true,
            created_at: email.created_at,
            updated_at: email.created_at
          };
        });
      }
    } catch (error) {
      console.error('Error fetching attendees:', error);
      return [];
    }
  },

  /**
   * Upload a CSV file of attendees for an event
   */
  async uploadAttendeesCSV(eventId: number, csvFile: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', csvFile);
      formData.append('event', eventId.toString());
      
      const response = await apiClient.post(`/organizers/attendance-list/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error uploading attendees CSV:', error);
      throw error;
    }
  },

  /**
   * Get upload history for an event
   */
  async getUploadHistory(eventId: number): Promise<AttendeeUpload[]> {
    try {
      const response = await apiClient.get(`/events/${eventId}/attendees/uploads/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching upload history for event ${eventId}:`, error);
      return [];
    }
  },

  /**
   * Get upload status
   */
  async getUploadStatus(uploadId: number): Promise<UploadStatus> {
    try {
      const response = await apiClient.get(`/attendee-uploads/${uploadId}/status/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching upload status for upload ${uploadId}:`, error);
      throw error;
    }
  }
};