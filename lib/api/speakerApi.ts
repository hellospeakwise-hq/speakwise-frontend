import { apiClient } from './base';
import { cachedFetch, CACHE_TTL } from '../utils/cache';

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

export interface CreateSkillData {
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
    skill_tags: SkillTag[];
    speaker_name: string;
    organization: string;
    short_bio: string;
    long_bio: string;
    country: string;
    avatar: string;
    user_account: string;
    username?: string;  // Username for friendly URLs
    slug?: string;      // Slug for URL routing (usually same as user_account)
}

// Helper to get the slug for a speaker (fallback to id if no username)
export function getSpeakerSlug(speaker: Speaker): string {
    return speaker.slug || speaker.user_account || speaker.username || speaker.id.toString();
}

export interface UpdateSpeakerProfileData {
    organization?: string;
    short_bio?: string;
    long_bio?: string;
    country?: string;
    skill_tags?: number[];
}

export const speakerApi = {
    // Get all speakers (cached for 5 minutes)
    async getSpeakers(): Promise<Speaker[]> {
        return cachedFetch(
            'speakers_list',
            async () => {
                const response = await apiClient.get<Speaker[]>('/speakers/');
                return response.data;
            },
            { ttl: CACHE_TTL.MEDIUM }
        );
    },

    // Get speaker by slug (ID or username) - cached per speaker
    async getSpeakerBySlug(slug: string): Promise<Speaker> {
        return cachedFetch(
            `speaker_${slug}`,
            async () => {
                const response = await apiClient.get<Speaker>(`/speakers/${slug}/`);
                return response.data;
            },
            { ttl: CACHE_TTL.MEDIUM }
        );
    },

    // Get speaker by ID (uses slug endpoint)
    async getSpeakerById(id: string): Promise<Speaker> {
        return this.getSpeakerBySlug(id);
    },

    // Get speaker by ID or username (uses slug endpoint)
    async getSpeakerByIdOrUsername(idOrUsername: string): Promise<Speaker> {
        return this.getSpeakerBySlug(idOrUsername);
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

    // Get all skill tags (legacy endpoint)
    async getSkillTags(): Promise<SkillTag[]> {
        const response = await apiClient.get<SkillTag[]>('/speakers/skill-tags/');
        return response.data;
    },

    // Create a new skill tag (legacy endpoint)
    async createSkillTag(name: string): Promise<SkillTag> {
        const response = await apiClient.post<SkillTag>('/speakers/skill-tags/', { name });
        return response.data;
    },

    // Get speaker's skills (new endpoint)
    async getSkills(): Promise<SkillTag[]> {
        const response = await apiClient.get<SkillTag[]>('/speakers/skills/');
        return response.data;
    },

    // Get skill by ID
    async getSkillById(id: number): Promise<SkillTag> {
        const response = await apiClient.get<SkillTag>(`/speakers/skills/${id}/`);
        return response.data;
    },

    // Create a new skill
    async createSkill(data: CreateSkillData): Promise<SkillTag> {
        const response = await apiClient.post<SkillTag>('/speakers/skills/', data);
        return response.data;
    },

    // Update a skill
    async updateSkill(id: number, data: Partial<CreateSkillData>): Promise<SkillTag> {
        const response = await apiClient.patch<SkillTag>(`/speakers/skills/${id}/`, data);
        return response.data;
    },

    // Delete a skill
    async deleteSkill(id: number): Promise<void> {
        await apiClient.delete(`/speakers/skills/${id}/`);
    }
};

export default speakerApi;
