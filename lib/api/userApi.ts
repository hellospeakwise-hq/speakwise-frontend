import apiClient from './base';
import { cachedFetch, CACHE_TTL, removeFromCache } from '../utils/cache';

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
    skill_tags: SkillTag[];
    speaker_name: string;
    organization: string;
    short_bio: string;
    long_bio: string;
    country: string;
    avatar: string;
    user_account: string;
    experiences?: any[];
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
    skill_tags?: number[];
    social_links?: any[];
}

export interface UpdateProfileData {
    user?: UpdateUserData;
    speaker?: UpdateSpeakerData;
}

export const userApi = {
    // Get user profile (GET /api/users/me/) - cached for faster loading
    async getUserProfile(): Promise<UserProfileResponse> {
        return cachedFetch(
            'user_profile',
            async () => {
                const response = await apiClient.get('/users/me/');
                return response.data;
            },
            { ttl: CACHE_TTL.SHORT } // 1 minute cache for user profile
        );
    },

    // Force refresh user profile (skip cache)
    async refreshUserProfile(): Promise<UserProfileResponse> {
        removeFromCache('user_profile');
        const response = await apiClient.get('/users/me/');
        return response.data;
    },

    // Update user profile (PATCH /api/users/me/)
    // Expects flat structure: all fields at root level
    async updateUserProfile(data: any): Promise<UserProfileResponse> {
        console.log('==========================================');
        console.log('📤 SENDING PROFILE UPDATE');
        console.log('==========================================');
        console.log('Data being sent:', JSON.stringify(data, null, 2));
        
        try {
            const response = await apiClient.patch('/users/me/', data);
            console.log('✅ UPDATE SUCCESS');
            console.log('Response:', response.data);
            // Invalidate cache after successful update
            removeFromCache('user_profile');
            removeFromCache('speakers_list');
            return response.data;
        } catch (error: any) {
            console.error('❌ UPDATE FAILED');
            console.error('Status:', error.response?.status);
            console.error('Status Text:', error.response?.statusText);
            console.error('Error data:', error.response?.data);
            console.error('Request data that was sent:', data);
            throw error;
        }
    },

    // Upload avatar (PATCH /api/users/me/)
    async uploadAvatar(file: File, speakerId?: number): Promise<UserProfileResponse> {
        const formData = new FormData();
        formData.append('avatar', file);
        
        // If we have a speaker ID, include it so backend knows which speaker to update
        if (speakerId) {
            formData.append('speaker_id', speakerId.toString());
        }
        
        console.log('📤 Uploading avatar for speaker ID:', speakerId);
        
        const response = await apiClient.patch('/users/me/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};