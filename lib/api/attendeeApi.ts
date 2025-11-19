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
      console.log('📥 Fetching attendees for event:', eventId);
      
      const response = await apiClient.get(`/organizers/create-attendance/`, {
        params: { event: eventId }
      });
      
      console.log('📦 Received attendance data:', response.data);
      
      if (Array.isArray(response.data)) {
        // Filter to ensure we only get attendees for this specific event
        const filtered = response.data.filter((item: AttendanceEmail) => item.event === eventId);
        console.log(`✅ Filtered ${filtered.length} attendees for event ${eventId}`);
        return filtered;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching attendance emails:', error);
      // Return empty array instead of throwing to avoid breaking the UI
      return [];
    }
  },

  /**
   * Get all attendees for an event
   */
  async getAttendeesByEvent(eventId: number): Promise<Attendee[]> {
    try {
      console.log('🔍 Getting attendees for event:', eventId);
      
      // Use attendance emails from create-attendance endpoint
      const attendanceEmails = await this.getAttendanceEmailsByEvent(eventId);
      
      console.log(`📋 Converting ${attendanceEmails.length} attendance emails to attendees`);
      
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
      
      console.log('📤 Uploading attendees CSV:', {
        eventId,
        fileName: csvFile.name,
        fileSize: csvFile.size,
        fileType: csvFile.type
      });
      
      const response = await apiClient.post(`/organizers/create-attendance/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('✅ Upload successful:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error uploading attendees CSV:', error);
      console.error('Error details:', {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message
      });
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
  },

  /**
   * Delete a single attendee
   */
  async deleteAttendee(attendeeId: number, eventId: number): Promise<void> {
    try {
      console.log('🗑️ Deleting attendee:', { attendeeId, eventId });
      
      await apiClient.delete(`/organizers/create-attendance/${attendeeId}/`, {
        params: { event: eventId }
      });
      
      console.log('✅ Attendee deleted successfully');
    } catch (error) {
      console.error('Error deleting attendee:', error);
      throw error;
    }
  },

  /**
   * Delete all attendees for an event
   */
  async deleteAllAttendees(eventId: number): Promise<void> {
    try {
      console.log('🗑️ Deleting all attendees for event:', eventId);
      
      await apiClient.delete(`/organizers/create-attendance/`, {
        params: { event: eventId }
      });
      
      console.log('✅ All attendees deleted successfully');
    } catch (error) {
      console.error('Error deleting all attendees:', error);
      throw error;
    }
  }
};