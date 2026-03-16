import apiClient from './base';

export interface Organization {
    id: string;
    name: string;
    slug: string;
    description: string;
    email: string;
    website?: string;
    logo?: string;
    is_active: boolean;
    created_by: string;
    members: string[];
}

export interface CreateOrganizationData {
    name: string;
    description: string;
    email: string;
    website?: string;
    logo?: File;
    is_active?: boolean;
}

export interface OrganizationMember {
    id: string;
    organization: string;
    user: string;
    username: string;
    role: 'ADMIN' | 'MEMBER' | 'MODERATOR';
    is_active: boolean;
    added_by: string;
}

export interface AddMemberData {
    user: string; // user UUID
    role?: 'ADMIN' | 'MEMBER' | 'MODERATOR';
}

export interface UserSearchResult {
    id: string;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
}

export const organizationApi = {
    // Get user's organizations (with client-side filtering as safeguard)
    async getUserOrganizations(): Promise<Organization[]> {
        const response = await apiClient.get('/organizations/');
        const allOrgs = response.data as Organization[];
        
        // Client-side filtering to ensure users only see their own organizations
        const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        if (!userStr) {
            return [];
        }
        
        try {
            const user = JSON.parse(userStr);
            const currentUserId = user.id;
            
            // Filter: user is creator OR user is a member
            return allOrgs.filter(org => 
                org.created_by === currentUserId || 
                (org.members && org.members.includes(currentUserId))
            );
        } catch {
            return [];
        }
    },

    // Get single organization by slug
    async getOrganization(slug: string): Promise<Organization> {
        const response = await apiClient.get(`/organizations/${slug}/`);
        const org: Organization = response.data;

        // Get current user ID from localStorage
        const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        if (!userStr) {
            throw new Error('User not authenticated');
        }

        try {
            const user = JSON.parse(userStr);
            const currentUserId = user.id;

            // Check if user has access to this organization
            if (org.created_by !== currentUserId && (!org.members || !org.members.includes(currentUserId))) {
                throw new Error('You do not have access to this organization');
            }

            return org;
        } catch (error: any) {
            throw error;
        }
    },

    // Create organization (uses FormData for file upload support)
    async createOrganization(data: CreateOrganizationData): Promise<Organization> {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('description', data.description);
        formData.append('email', data.email);
        if (data.website) formData.append('website', data.website);
        if (data.logo) formData.append('logo', data.logo);
        if (data.is_active !== undefined) formData.append('is_active', String(data.is_active));

        const response = await apiClient.post('/organizations/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    // Update organization by slug
    async updateOrganization(slug: string, data: Partial<CreateOrganizationData>): Promise<Organization> {
        const response = await apiClient.patch(`/organizations/${slug}/`, data);
        return response.data;
    },

    // Delete organization by slug
    async deleteOrganization(slug: string): Promise<void> {
        await apiClient.delete(`/organizations/${slug}/`);
    },

    // Get organization members by slug
    async getOrganizationMembers(slug: string): Promise<OrganizationMember[]> {
        const response = await apiClient.get(`/organizations/${slug}/members/`);
        return response.data;
    },

    // Search users by username or email
    async searchUsers(query: string): Promise<UserSearchResult[]> {
        const response = await apiClient.get('/users/', {
            params: { username: query }
        });
        return response.data;
    },

    // Add member to organization by slug (sends user UUID)
    async addOrganizationMember(slug: string, data: AddMemberData): Promise<OrganizationMember> {
        const response = await apiClient.post(`/organizations/${slug}/members/`, {
            user: data.user,
        });
        return response.data;
    },

    // Remove member from organization by org_slug and username
    async removeOrganizationMember(orgSlug: string, username: string): Promise<void> {
        await apiClient.delete(`/organizations/${orgSlug}/members/${username}/`);
    }
};
