import { apiClient } from './base';

export interface SpeakerProfile {
    id: number;
    speaker_user: number;
    organization: string;
    short_bio: string;
    long_bio: string;
    country: string;
    avatar?: string;
    skill_tags: number[];
    events_spoken: number[];
    created_at: string;
    updated_at: string;
}

export interface SkillTag {
    id: number;
    name: string;
}

export interface Speaker {
    id: number;
    speaker_name: string;
    organization: string;
    country: string;
    short_bio: string;
    avatar?: string;
    skill_tag: SkillTag[];
}

export interface UpdateSpeakerProfileData {
    organization?: string;
    short_bio?: string;
    long_bio?: string;
    country?: string;
    skill_tags?: number[];
}

export const speakerApi = {
    // Get all speakers
    async getSpeakers(): Promise<Speaker[]> {
        const response = await apiClient.get<Speaker[]>('/speakers/');
        return response.data;
    },

    // Get speaker profile
    async getProfile(): Promise<SpeakerProfile> {
        const response = await apiClient.get<SpeakerProfile>('/speakers/profile/');
        return response.data;
    },

    // Update speaker profile
    async updateProfile(data: UpdateSpeakerProfileData): Promise<SpeakerProfile> {
        const response = await apiClient.patch<SpeakerProfile>('/speakers/profile/', data);
        return response.data;
    },

    // Upload speaker avatar
    async uploadAvatar(file: File): Promise<SpeakerProfile> {
        const formData = new FormData();
        formData.append('avatar', file);
        const response = await apiClient.post<SpeakerProfile>('/speakers/profile/avatar/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // Get all skill tags
    async getSkillTags(): Promise<SkillTag[]> {
        const response = await apiClient.get<SkillTag[]>('/speakers/skill-tags/');
        return response.data;
    },

    // Create a new skill tag
    async createSkillTag(name: string): Promise<SkillTag> {
        const response = await apiClient.post<SkillTag>('/speakers/skill-tags/', { name });
        return response.data;
    }
};

export default speakerApi;
