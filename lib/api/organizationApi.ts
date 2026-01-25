import apiClient from './base';

export interface Organization {
    id: number;
    name: string;
    description: string;
    email: string;
    website?: string;
    logo?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    created_by: string;
    members: string[];
}

export interface CreateOrganizationData {
    name: string;
    description: string;
    email: string;
    website?: string;
    logo?: string;
    is_active?: boolean;
}

export interface OrganizationMember {
    id: number;
    organization: number;
    user: string;
    username: string;
    role: 'ADMIN' | 'MEMBER' | 'MODERATOR';
    is_active: boolean;
    added_by: string;
    created_at: string;
    updated_at: string;
}

export interface AddMemberData {
    username: string;
    role?: 'ADMIN' | 'MEMBER' | 'MODERATOR';
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

    // Get single organization
    async getOrganization(id: number): Promise<Organization> {
        const response = await apiClient.get(`/organizations/${id}/`);
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

    // Create organization
    async createOrganization(data: CreateOrganizationData): Promise<Organization> {
        const response = await apiClient.post('/organizations/', data);
        return response.data;
    },

    // Update organization
    async updateOrganization(id: number, data: Partial<CreateOrganizationData>): Promise<Organization> {
        const response = await apiClient.patch(`/organizations/${id}/`, data);
        return response.data;
    },

    // Delete organization
    async deleteOrganization(id: number): Promise<void> {
        await apiClient.delete(`/organizations/${id}/`);
    },

    // Get organization members
    async getOrganizationMembers(organizationId: number): Promise<OrganizationMember[]> {
        const response = await apiClient.get(`/organizations/${organizationId}/members/`);
        return response.data;
    },

    // Add member to organization
    async addOrganizationMember(organizationId: number, data: AddMemberData): Promise<OrganizationMember> {
        const response = await apiClient.post(`/organizations/${organizationId}/members/`, data);
        return response.data;
    },

    // Remove member from organization
    async removeOrganizationMember(organizationId: number, memberId: number): Promise<void> {
        await apiClient.delete(`/organizations/${organizationId}/members/${memberId}/`);
    },

    // Update member role
    async updateMemberRole(organizationId: number, memberId: number, role: 'ADMIN' | 'MEMBER' | 'MODERATOR'): Promise<OrganizationMember> {
        const response = await apiClient.patch(`/organizations/${organizationId}/members/${memberId}/`, { role });
        return response.data;
    }
};
