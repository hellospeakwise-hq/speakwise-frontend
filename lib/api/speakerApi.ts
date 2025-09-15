import { authenticatedAPI } from './authenticatedAPI'

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

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

export interface UpdateSpeakerProfileData {
    organization?: string;
    short_bio?: string;
    long_bio?: string;
    country?: string;
    skill_tags?: number[];
}

export const speakerApi = {
    // Get speaker profile
    async getProfile(): Promise<SpeakerProfile> {
        return authenticatedAPI.get('/api/speakers/profile/')
    },

    // Update speaker profile
    async updateProfile(data: UpdateSpeakerProfileData): Promise<SpeakerProfile> {
        return authenticatedAPI.patch('/api/speakers/profile/', data)
    },

    // Upload speaker avatar
    async uploadAvatar(file: File): Promise<SpeakerProfile> {
        const formData = new FormData();
        formData.append('avatar', file);
        return authenticatedAPI.postFormData('/api/speakers/profile/avatar/', formData)
    },

    // Get all skill tags
    async getSkillTags(): Promise<SkillTag[]> {
        return authenticatedAPI.get('/api/speakers/skill-tags/')
    },

    // Create a new skill tag
    async createSkillTag(name: string): Promise<SkillTag> {
        return authenticatedAPI.post('/api/speakers/skill-tags/', { name })
    }
};
