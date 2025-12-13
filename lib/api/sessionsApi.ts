// API client for SpeakWise backend - Sessions endpoints
import { Speaker } from './speakerApi';
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api`;

// Location interface to match the actual backend response
export interface Location {
    id: number;
    country: {
        id: number;
        name: string;
        code?: string;
    };
    venue?: string;
    address?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    latitude?: number;
    longitude?: number;
    description?: string;
}

export interface Session {
    id: number;
    name: string;
    description: string;
    start_date_time: string;
    end_date_time: string;
    location: string | Location; // Can be either string or Location object
    event: number;
    speaker?: number;
    speaker_details?: Speaker;
}

class SessionsAPI {
    async getEventSessions(eventId: number): Promise<Session[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/events/${eventId}/sessions/`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching sessions for event ${eventId}:`, error);
            throw error;
        }
    }

    async createSessionWithSpeaker(eventId: number, sessionData: Partial<Session>): Promise<Session> {
        try {
            const response = await fetch(`${API_BASE_URL}/events/${eventId}/sessions/create/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sessionData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error creating session for event ${eventId}:`, error);
            throw error;
        }
    }

    async updateSession(sessionId: number, sessionData: Partial<Session>): Promise<Session> {
        try {
            const response = await fetch(`${API_BASE_URL}/events/sessions/${sessionId}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sessionData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error updating session ${sessionId}:`, error);
            throw error;
        }
    }

    async deleteSession(sessionId: number): Promise<void> {
        try {
            const response = await fetch(`${API_BASE_URL}/events/sessions/${sessionId}/`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error(`Error deleting session ${sessionId}:`, error);
            throw error;
        }
    }
}

// Create and export a singleton instance
export const sessionsAPI = new SessionsAPI();
