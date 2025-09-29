// API client for SpeakWise backend - Speakers endpoints

export interface SocialLink {
    name: string;
    link: string;
}

export interface SkillTag {
    id: number;
    name: string;
    description: string;
    duration: number;
}

export interface Speaker {
    id: number;
    social_links: SocialLink[];
    organization: string;
    short_bio: string;
    long_bio: string;
    country: string;
    avatar: string;
    user_account: string;
    skill_tag: SkillTag[];
    speaker_name: string;
}

class SpeakersAPI {
    async getSpeakers(): Promise<Speaker[]> {
        try {
            const response = await fetch(`/api/proxy/speakers/`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const speakers = await response.json();
            
            // Add full_name for backward compatibility
            return speakers.map((speaker: Speaker) => ({
                ...speaker,
                full_name: speaker.speaker_name || `Speaker ${speaker.id}`
            }));
        } catch (error) {
            console.error('Error fetching speakers:', error);
            throw error;
        }
    }

    async getSpeakerById(id: number): Promise<Speaker> {
        try {
            const response = await fetch(`/api/proxy/speakers/${id}/`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const speaker = await response.json();
            
            // Add full_name for backward compatibility
            return {
                ...speaker,
                full_name: speaker.speaker_name || `Speaker ${speaker.id}`
            };
        } catch (error) {
            console.error('Error fetching speaker:', error);
            throw error;
        }
    }

    async getEventSpeakers(eventId: number): Promise<Speaker[]> {
        try {
            const response = await fetch(`/api/proxy/events/${eventId}/speakers/`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const speakers = await response.json();
            
            // Add full_name for backward compatibility
            return speakers.map((speaker: Speaker) => ({
                ...speaker,
                full_name: speaker.speaker_name || `Speaker ${speaker.id}`
            }));
        } catch (error) {
            console.error(`Error fetching speakers for event ${eventId}:`, error);
            throw error;
        }
    }

    async addSpeakerToEvent(eventId: number, speakerId: number): Promise<any> {
        try {
            const response = await fetch(`/api/proxy/events/${eventId}/speakers/add/`, {
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
            const response = await fetch(`/api/proxy/events/${eventId}/speakers/remove/`, {
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