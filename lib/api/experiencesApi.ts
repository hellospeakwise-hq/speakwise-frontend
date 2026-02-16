import apiClient from './base';

export interface SpeakerExperience {
    id?: number;
    event_name: string;
    event_date: string;
    topic: string;
    description: string;
    presentation_link?: string;
    video_recording_link?: string;
    created_at?: string;
    updated_at?: string;
}

export interface CreateExperienceData {
    event_name: string;
    event_date: string;
    topic: string;
    description: string;
    presentation_link?: string;
    video_recording_link?: string;
}

export const experiencesApi = {
    // Get all experiences for the authenticated speaker
    async getMyExperiences(): Promise<SpeakerExperience[]> {
        try {
            const response = await apiClient.get('/speakers/experiences/');
            return response.data;
        } catch (error: any) {
            console.error('Error fetching experiences:', error);
            throw error;
        }
    },

    // Get experiences for a specific speaker by slug (public endpoint - no auth required)
    async getSpeakerExperiencesBySlug(slug: string): Promise<SpeakerExperience[]> {
        try {
            const response = await apiClient.get(`/speakers/${slug}/experiences/`);
            return response.data || [];
        } catch (error: any) {
            console.error('Error fetching speaker experiences:', error);
            return []; // Return empty array instead of throwing
        }
    },

    // Get experiences for a specific speaker by ID (legacy - uses slug endpoint)
    async getSpeakerExperiences(speakerId: number): Promise<SpeakerExperience[]> {
        return this.getSpeakerExperiencesBySlug(speakerId.toString());
    },

    // Get a specific experience by ID
    async getExperience(id: number): Promise<SpeakerExperience> {
        const response = await apiClient.get(`/speakers/experiences/${id}/`);
        return response.data;
    },

    // Create a new experience
    async createExperience(data: CreateExperienceData): Promise<SpeakerExperience> {
        try {
            const response = await apiClient.post('/speakers/experiences/', data);
            return response.data;
        } catch (error: any) {
            console.error('Failed to create experience:', error);
            throw error;
        }
    },

    // Update an experience
    async updateExperience(id: number, data: Partial<CreateExperienceData>): Promise<SpeakerExperience> {
        const response = await apiClient.patch(`/speakers/experiences/${id}/`, data);
        return response.data;
    },

    // Delete an experience
    async deleteExperience(id: number): Promise<void> {
        await apiClient.delete(`/speakers/experiences/${id}/`);
    }
};

export default experiencesApi;
