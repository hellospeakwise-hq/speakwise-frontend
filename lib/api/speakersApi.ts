// API client for SpeakWise backend - Speakers endpoints
const API_BASE_URL = 'http://127.0.0.1:8000/api';

export interface SocialLink {
    id?: number;
    social_name: string;
    social_url: string;
    is_active?: boolean;
    display_order?: number;
}

export interface SkillTag {
    id: number;
    name: string;
}

export interface Speaker {
    id: number;
    speaker_user: number;
    organization?: string;
    short_bio?: string;
    long_bio: string;
    country?: string;
    avatar?: string;
    skill_tags?: SkillTag[];
    social_links?: SocialLink[];
    full_name: string;
}

class SpeakersAPI {
    async getSpeakers(): Promise<Speaker[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/speakers/`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching speakers:', error);
            throw error;
        }
    }

    async getSpeakerById(id: number): Promise<Speaker> {
        try {
            const response = await fetch(`${API_BASE_URL}/speakers/${id}/`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching speaker:', error);
            throw error;
        }
    }

    async getEventSpeakers(eventId: number): Promise<Speaker[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/events/${eventId}/speakers/`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching speakers for event ${eventId}:`, error);
            throw error;
        }
    }

    async addSpeakerToEvent(eventId: number, speakerId: number): Promise<any> {
        try {
            const response = await fetch(`${API_BASE_URL}/events/${eventId}/speakers/add/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ speaker_id: speakerId })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error adding speaker to event ${eventId}:`, error);
            throw error;
        }
    }

    async removeSpeakerFromEvent(eventId: number, speakerId: number): Promise<any> {
        try {
            const response = await fetch(`${API_BASE_URL}/events/${eventId}/speakers/remove/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ speaker_id: speakerId })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error removing speaker from event ${eventId}:`, error);
            throw error;
        }
    }
}

// Create and export a singleton instance
export const speakersAPI = new SpeakersAPI();