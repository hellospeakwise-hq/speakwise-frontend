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
    description?: string;
    duration?: number;
}

export interface SocialLink {
    id: number;
    name: string;
    link: string;
}

export interface Speaker {
    id: number;
    social_links: SocialLink[];
    skill_tag: SkillTag[];
    speaker_name: string;
    organization: string;
    short_bio: string;
    long_bio: string;
    country: string;
    avatar: string;
    user_account: string;
    username?: string;  // Username for friendly URLs
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

    // Get speaker by ID
    async getSpeakerById(id: string): Promise<Speaker> {
        const response = await apiClient.get<Speaker[]>('/speakers/');
        const speakers = response.data;
        const speaker = speakers.find(s => s.id.toString() === id);
        if (!speaker) {
            throw new Error('Speaker not found');
        }
        return speaker;
    },

    // Get speaker by ID or username
    async getSpeakerByIdOrUsername(idOrUsername: string): Promise<Speaker> {
        const response = await apiClient.get<Speaker[]>('/speakers/');
        const speakers = response.data;
        
        // First try to find by ID if it's a number
        if (/^\d+$/.test(idOrUsername)) {
            const speaker = speakers.find(s => s.id.toString() === idOrUsername);
            if (speaker) return speaker;
        }
        
        // Try to find by username (from user_account or speaker_name)
        const speakerByUsername = speakers.find(s => {
            // user_account might contain the username
            const userAccount = s.user_account?.toLowerCase();
            const searchTerm = idOrUsername.toLowerCase();
            return userAccount === searchTerm || 
                   s.speaker_name?.toLowerCase().replace(/\s+/g, '').includes(searchTerm);
        });
        
        if (speakerByUsername) return speakerByUsername;
        
        throw new Error('Speaker not found');
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

    // Upload speaker avatar - try multiple endpoints
    async uploadAvatar(file: File): Promise<SpeakerProfile> {
        const formData = new FormData();
        formData.append('avatar', file);
        
        console.log('📤 Uploading avatar...');
        
        // Try the dedicated avatar endpoint first
        try {
            const response = await apiClient.post<SpeakerProfile>('/speakers/profile/avatar/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            console.log('✅ Avatar uploaded via /speakers/profile/avatar/');
            return response.data;
        } catch (error: any) {
            console.log('❌ /speakers/profile/avatar/ failed, trying /speakers/profile/...');
            
            // Fallback to PATCH on profile endpoint
            const response = await apiClient.patch<SpeakerProfile>('/speakers/profile/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            console.log('✅ Avatar uploaded via PATCH /speakers/profile/');
            return response.data;
        }
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
