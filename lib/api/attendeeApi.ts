// API client for SpeakWise Attendees
import { authenticatedAPI } from './authenticatedAPI';

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

// AttendeeAPI class with methods for managing attendees
class AttendeeAPI {
  // Get all attendance emails for an event (existing backend functionality)
  async getAttendanceEmailsByEvent(eventId: number): Promise<AttendanceEmail[]> {
    try {
      console.log(`Fetching attendance emails for event ${eventId}`);
      const response = await authenticatedAPI.get(`/api/organizers/attendance-list/`);
      console.log('Raw attendance emails data received:', response);
      console.log('Response type:', typeof response, 'Is array:', Array.isArray(response));
      
      // Filter by event ID on frontend since backend might return all
      if (Array.isArray(response)) {
        const filtered = response.filter((item: AttendanceEmail) => {
          console.log(`Checking item:`, item, `item.event: ${item.event}, eventId: ${eventId}, match: ${item.event === eventId}`);
          return item.event === eventId;
        });
        console.log(`Filtered ${filtered.length} emails for event ${eventId} from ${response.length} total`);
        return filtered;
      }
      
      console.log('Response is not an array, returning empty array');
      return [];
    } catch (error) {
      console.error('Error fetching attendance emails:', error);
      throw error;
    }
  }

  // Get all attendees for an event (fallback method)
  async getAttendeesByEvent(eventId: number): Promise<Attendee[]> {
    try {
      console.log(`Fetching attendees for event ${eventId}`);
      // This endpoint may not exist yet, so we'll try attendance emails first
      const attendanceEmails = await this.getAttendanceEmailsByEvent(eventId);
      
      // Convert attendance emails to attendee format for UI compatibility
      return attendanceEmails.map((email) => {
        // Extract potential name from email address
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
  }

  // Upload a CSV file of attendees for an event (using existing backend)
  async uploadAttendeesCSV(eventId: number, csvFile: File): Promise<any> {
    try {
      console.log(`Uploading attendees CSV for event ${eventId}`);
      
      // Create FormData for file upload using backend expected field names
      const formData = new FormData();
      formData.append('file', csvFile); // Backend expects 'file'
      formData.append('event', eventId.toString());
      
      const response = await authenticatedAPI.postFormData(`/api/organizers/attendance-list/`, formData);
      console.log('CSV upload response:', response);
      return response;
    } catch (error) {
      console.error('Error uploading attendees CSV:', error);
      throw error;
    }
  }

  // Get upload history for an event
  async getUploadHistory(eventId: number): Promise<AttendeeUpload[]> {
    try {
      // This endpoint might not exist yet, return empty array for now
      console.log(`Getting upload history for event ${eventId}`);
      return [];
    } catch (error) {
      console.error(`Error fetching upload history for event ${eventId}:`, error);
      return [];
    }
  }

  // Get upload status
  async getUploadStatus(uploadId: number): Promise<UploadStatus> {
    try {
      // This endpoint might not exist yet, return default status
      return {
        total: 0,
        successful: 0,
        failed: 0,
        errors: []
      };
    } catch (error) {
      console.error(`Error fetching upload status for upload ${uploadId}:`, error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const attendeeAPI = new AttendeeAPI();
