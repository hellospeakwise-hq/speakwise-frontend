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
            console.log('🔍 API: Fetching my experiences from /speakers/experiences/');
            const response = await apiClient.get('/speakers/experiences/');
            console.log('📥 API Response:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ API Error:', error);
            console.error('Response:', error.response?.data);
            console.error('Status:', error.response?.status);
            throw error;
        }
    },

    // Get experiences for a specific speaker (public)
    async getSpeakerExperiences(speakerId: number): Promise<SpeakerExperience[]> {
        const response = await apiClient.get(`/speakers/experiences/?speaker=${speakerId}`);
        return response.data;
    },

    // Get a specific experience by ID
    async getExperience(id: number): Promise<SpeakerExperience> {
        const response = await apiClient.get(`/speakers/experiences/${id}/`);
        return response.data;
    },

    // Create a new experience
    async createExperience(data: CreateExperienceData): Promise<SpeakerExperience> {
        try {
            console.log('📤 Creating experience with data:', data);
            const response = await apiClient.post('/speakers/experiences/', data);
            console.log('✅ Experience created:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Failed to create experience:', error);
            console.error('Response:', error.response?.data);
            console.error('Status:', error.response?.status);
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
