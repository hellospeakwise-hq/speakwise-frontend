import apiClient from './base';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export interface SkillTag {
    id: number;
    name: string;
    description: string;
    duration: number;
}

export interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    nationality: string;
    username: string;
}

export interface SpeakerProfile {
    id: number;
    social_links: any[];
    skill_tag: SkillTag[];
    speaker_name: string;
    organization: string;
    short_bio: string;
    long_bio: string;
    country: string;
    avatar: string;
    user_account: string;
}

export interface UserProfileResponse {
    user: User;
    speaker: SpeakerProfile;
}

export interface UpdateUserData {
    first_name?: string;
    last_name?: string;
    nationality?: string;
    username?: string;
}

export interface UpdateSpeakerData {
    organization?: string;
    short_bio?: string;
    long_bio?: string;
    country?: string;
    skill_tag?: number[];
    social_links?: any[];
}

export interface UpdateProfileData {
    user?: UpdateUserData;
    speaker?: UpdateSpeakerData;
}

export const userApi = {
    // Get user profile (GET /api/users/me/)
    async getUserProfile(): Promise<UserProfileResponse> {
        const response = await apiClient.get('/users/me/');
        return response.data;
    },

    // Update user profile (PUT /api/users/me/)
    async updateUserProfile(data: UpdateProfileData): Promise<UserProfileResponse> {
        const response = await apiClient.put('/users/me/', data);
        return response.data;
    },

    // Upload avatar
    async uploadAvatar(file: File): Promise<UserProfileResponse> {
        const formData = new FormData();
        formData.append('avatar', file);
        
        const response = await apiClient.put('/users/me/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};