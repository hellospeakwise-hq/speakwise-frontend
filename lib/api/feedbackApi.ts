// API client for SpeakWise backend - Feedback endpoints
import { apiClient } from './base';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export interface FeedbackData {
    session: number;
    attendee: number | null;
    // NEW: Backend requires explicit speaker id the feedback is for
    // This links the feedback to the correct speaker dashboard
    speaker: number;
    overall_rating: number;
    engagement: number;
    clarity: number;
    content_depth: number;
    speaker_knowledge: number;
    practical_relevance: number;
    comments?: string | null;  // Backend uses "comments" (plural)
    is_anonymous?: boolean;
    is_editable?: boolean;
}

export interface Feedback extends FeedbackData {
    id: number;
    created_at: string;
    updated_at: string;
    // Some responses may include these flags
    is_attendee?: boolean;
}

export interface AttendeeVerification {
    email: string;
    event?: number;
}

class FeedbackAPI {
    // Verify attendee email against attendance list for a specific event
    // This should call a PUBLIC endpoint that checks if email is in attendance list
    // Backend team needs to create: POST /api/attendees/verify-email/
    async verifyAttendeeEmail(email: string, eventId: string): Promise<{ verified: boolean; message?: string; is_attendee?: boolean }> {
        try {
            console.log('🔐 Verifying attendee email:', email, 'for event:', eventId);

            // TODO: Backend team needs to create this PUBLIC endpoint
            // Endpoint: POST /api/attendees/verify-email/
            // Body: { email: string, event_id: number }
            // Response: { is_attendee: boolean, message: string }
            // This endpoint should NOT require authentication

            const response = await fetch(`${API_BASE_URL}/attendees/verify/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    event_id: parseInt(eventId, 10)
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Verification response:', data);

            // Backend should return: { is_attendee: true/false, message: "..." }
            const isAttendee = data.is_attendee === true;

            return {
                verified: isAttendee,
                is_attendee: isAttendee,
                message: data.message || (isAttendee
                    ? "Your attendance has been verified successfully."
                    : "Email not found in attendance list for this event.")
            };
        } catch (error) {
            console.error('Error verifying attendee email:', error);

            const errorMessage = error instanceof Error ? error.message : 'Failed to verify attendance. Please try again.';

            return {
                verified: false,
                is_attendee: false,
                message: errorMessage
            };
        }
    }

    // Legacy method - kept for backward compatibility
    // Verify attendee email against the uploaded attendance list
    // NOTE: This is the old method, use verifyAttendeeViaFeedbackEndpoint instead
    async verifyAttendee(email: string, eventId?: number): Promise<{ verified: boolean; message?: string }> {
        try {
            console.log('🔐 Verifying attendee (legacy method):', email, 'for event:', eventId);

            // TODO: Replace with actual backend endpoint when available
            // For now, this is a placeholder that calls the old endpoint
            const response = await apiClient.post('/attendees/verify-attendee/', {
                email,
                event: eventId
            });

            console.log('✅ Verification response:', response.data);

            return {
                verified: response.data.verified || false,
                message: response.data.message
            };
        } catch (error) {
            console.error('Error verifying attendee:', error);
            return {
                verified: false,
                message: "Failed to verify attendance. Please try again."
            };
        }
    }

    // Submit feedback
    async submitFeedback(feedbackData: FeedbackData): Promise<Feedback> {
        try {
            const response = await fetch(`${API_BASE_URL}/feedbacks/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(feedbackData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to submit feedback');
            }

            return await response.json();
        } catch (error) {
            console.error('Error submitting feedback:', error);
            throw error;
        }
    }

    // Get feedback by ID
    async getFeedbackById(feedbackId: number): Promise<Feedback> {
        try {
            const response = await fetch(`${API_BASE_URL}/feedbacks/${feedbackId}/`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error fetching feedback ${feedbackId}:`, error);
            throw error;
        }
    }

    // Update feedback (within 24 hours)
    async updateFeedback(feedbackId: number, feedbackData: Partial<FeedbackData>): Promise<Feedback> {
        try {
            const response = await fetch(`${API_BASE_URL}/feedbacks/${feedbackId}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(feedbackData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to update feedback');
            }

            return await response.json();
        } catch (error) {
            console.error(`Error updating feedback ${feedbackId}:`, error);
            throw error;
        }
    }

    // Get all feedback (for speakers/organizers/admins)
    async getAllFeedback(): Promise<Feedback[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/feedbacks/`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching all feedback:', error);
            throw error;
        }
    }

    // Get feedback for a specific session
    async getSessionFeedback(sessionId: number): Promise<Feedback[]> {
        try {
            const allFeedback = await this.getAllFeedback();
            return allFeedback.filter(feedback => feedback.session === sessionId);
        } catch (error) {
            console.error(`Error fetching feedback for session ${sessionId}:`, error);
            throw error;
        }
    }

    // Get feedback for a specific speaker (across all their sessions)
    async getSpeakerFeedback(speakerId: number): Promise<Feedback[]> {
        try {
            // This would need to be implemented based on the relationship between speakers and sessions
            // For now, we'll need to fetch sessions by speaker first, then get feedback for those sessions
            const allFeedback = await this.getAllFeedback();
            // TODO: Filter by speaker's sessions once we have that relationship mapped
            return allFeedback;
        } catch (error) {
            console.error(`Error fetching feedback for speaker ${speakerId}:`, error);
            throw error;
        }
    }

    // Get feedback for the current authenticated speaker
    async getCurrentSpeakerFeedback(): Promise<Feedback[]> {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_BASE_URL}/feedbacks/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching current speaker feedback:', error);
            throw error;
        }
    }

    // Get talk details by session ID (since sessions are linked to talks)
    async getSessionDetails(sessionId: number): Promise<{ title: string; eventName: string; eventDate?: string }> {
        // Try to get talk details directly using session ID as talk ID
        // If that fails, try to get session details first
        return await this.getTalkDetails(sessionId);
    }

    // Get talk details from talk API
    async getTalkDetails(talkId: number): Promise<{ title: string; eventName: string; eventDate?: string }> {
        try {
            const token = localStorage.getItem('accessToken');

            const response = await fetch(`${API_BASE_URL}/talks/${talkId}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                // Don't log 404 errors - endpoint may not exist yet
                if (response.status !== 404) {
                    console.warn(`Talk API returned ${response.status} for talk ${talkId}`);
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const talkData = await response.json();

            // Handle event name and date - fetch event details using the event ID
            console.log(`Talk data event field:`, talkData.event, typeof talkData.event);
            let eventName = `Event ${talkId}`;
            let eventDate = talkData.event?.date || talkData.event_date || talkData.date;

            if (talkData.event && typeof talkData.event === 'number') {
                // Event is just an ID, fetch the event details (name and date)
                console.log(`Attempting to fetch event details for ID: ${talkData.event}`);
                try {
                    const eventDetails = await this.getEventDetails(talkData.event);
                    eventName = eventDetails.name;
                    if (eventDetails.date) {
                        eventDate = eventDetails.date;
                    }
                    console.log(`Successfully got event name: ${eventName}, date: ${eventDate}`);
                } catch (error) {
                    console.log(`Event API failed, using fallback`);
                    // If event API fails, use a generic name
                    eventName = "Conference Event";
                }
            } else if (talkData.event?.name) {
                eventName = talkData.event.name;
                eventDate = talkData.event.date || eventDate;
                console.log(`Using event name from talk data: ${eventName}`);
            } else if (talkData.event_name) {
                eventName = talkData.event_name;
                console.log(`Using event_name from talk data: ${eventName}`);
            }

            return {
                title: talkData.title || talkData.name || `Talk ${talkId}`,
                eventName: eventName,
                eventDate: eventDate
            };
        } catch (error) {
            // Only log non-404 errors to reduce console noise
            if (error instanceof Error && !error.message.includes('404')) {
                console.error(`Error fetching talk ${talkId} details:`, error);
            }

            // Return sample data instead of generic placeholders
            return this.getSampleSessionData(talkId);
        }
    }

    // Get event details by event ID using the correct endpoint
    async getEventDetails(eventId: number): Promise<{ name: string; date?: string }> {
        try {
            const token = localStorage.getItem('accessToken');
            console.log(`🎪 Fetching event details for event ID: ${eventId}`);

            const response = await fetch(`${API_BASE_URL}/events/${eventId}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            console.log(`📡 Event API response for ${eventId}:`, response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const eventData = await response.json();
            console.log(`✅ Event data for ID ${eventId}:`, eventData);

            // Extract the date from the event data - check all possible date fields
            let eventDate;

            // First, check if there's a formatted 'date' field (the display date)
            if (eventData.date) {
                eventDate = eventData.date;
                console.log(`📅 Using eventData.date: ${eventDate}`);
            }
            // Check date_range structure
            else if (eventData.date_range) {
                if (typeof eventData.date_range.start === 'string') {
                    eventDate = eventData.date_range.start;
                    console.log(`📅 Using date_range.start (string): ${eventDate}`);
                } else if (eventData.date_range.start?.date) {
                    eventDate = eventData.date_range.start.date;
                    console.log(`📅 Using date_range.start.date: ${eventDate}`);
                } else if (eventData.date_range.start?.datetime) {
                    eventDate = eventData.date_range.start.datetime;
                    console.log(`📅 Using date_range.start.datetime: ${eventDate}`);
                }
            }
            // Fallback to raw datetime fields
            else if (eventData.start_date_time) {
                eventDate = eventData.start_date_time;
                console.log(`📅 Using start_date_time: ${eventDate}`);
            }
            else if (eventData.start_date) {
                eventDate = eventData.start_date;
                console.log(`📅 Using start_date: ${eventDate}`);
            }
            else if (eventData.created_at) {
                eventDate = eventData.created_at;
                console.log(`📅 Using created_at: ${eventDate}`);
            }

            console.log(`📅 Final eventDate value: ${eventDate}`);

            return {
                name: eventData.name || eventData.title || `Event ${eventId}`,
                date: eventDate
            };
        } catch (error) {
            console.error(`❌ Failed to fetch event ${eventId} details:`, error);
            // Return a fallback instead of throwing
            return {
                name: `Event ${eventId}`,
                date: undefined
            };
        }
    }

    // Generate sample session data for development/demo
    private getSampleSessionData(sessionId: number): { title: string; eventName: string; eventDate?: string } {
        const sampleTitles = [
            "Introduction to Modern Web Development",
            "Building Scalable React Applications",
            "The Future of JavaScript Frameworks",
            "API Design Best Practices",
            "Database Optimization Strategies",
            "Cloud Architecture Patterns",
            "Security in Modern Web Apps",
            "Performance Optimization Techniques",
            "Microservices Architecture",
            "DevOps Best Practices"
        ];

        const sampleEvents = [
            "TechConf 2024",
            "React Summit",
            "Web Dev Meetup",
            "Developer Conference",
            "CodeCamp NYC",
            "Frontend Masters",
            "Tech Talk Tuesday",
            "Innovation Summit",
            "JSConf",
            "DevFest"
        ];

        const sampleDates = [
            "October 15, 2024",
            "September 22, 2024",
            "November 5, 2024",
            "August 18, 2024",
            "December 3, 2024"
        ];

        return {
            title: sampleTitles[(sessionId - 1) % sampleTitles.length] || `Talk #${sessionId}`,
            eventName: sampleEvents[(sessionId - 1) % sampleEvents.length] || `Event #${sessionId}`,
            eventDate: sampleDates[(sessionId - 1) % sampleDates.length]
        };
    }

    // Get multiple session details efficiently
    async getMultipleSessionDetails(sessionIds: number[]): Promise<Map<number, { title: string; eventName: string; eventDate?: string }>> {
        try {
            // Fetch all session details in parallel (which will get talk details)
            const sessionPromises = sessionIds.map(async (sessionId) => {
                const details = await this.getSessionDetails(sessionId);
                return { sessionId, details };
            });

            const results = await Promise.all(sessionPromises);

            // Convert results to Map
            const sessionDetailsMap = new Map<number, { title: string; eventName: string; eventDate?: string }>();
            results.forEach(({ sessionId, details }) => {
                sessionDetailsMap.set(sessionId, details);
            });

            return sessionDetailsMap;
        } catch (error) {
            console.error('Error fetching multiple session details:', error);

            // Return map with sample data
            const fallbackMap = new Map<number, { title: string; eventName: string; eventDate?: string }>();
            sessionIds.forEach(sessionId => {
                fallbackMap.set(sessionId, this.getSampleSessionData(sessionId));
            });

            return fallbackMap;
        }
    }

    // Get multiple talk details directly
    async getMultipleTalkDetails(talkIds: number[]): Promise<Map<number, { title: string; eventName: string; eventDate?: string }>> {
        try {
            // Fetch all talk details in parallel
            const talkPromises = talkIds.map(async (talkId) => {
                const details = await this.getTalkDetails(talkId);
                return { talkId, details };
            });

            const results = await Promise.all(talkPromises);

            // Convert results to Map
            const talkDetailsMap = new Map<number, { title: string; eventName: string; eventDate?: string }>();
            results.forEach(({ talkId, details }) => {
                talkDetailsMap.set(talkId, details);
            });

            return talkDetailsMap;
        } catch (error) {
            console.error('Error fetching multiple talk details:', error);

            // Return map with sample data
            const fallbackMap = new Map<number, { title: string; eventName: string; eventDate?: string }>();
            talkIds.forEach(talkId => {
                fallbackMap.set(talkId, this.getSampleSessionData(talkId));
            });

            return fallbackMap;
        }
    }
}

// Create and export a singleton instance
export const feedbackAPI = new FeedbackAPI();
