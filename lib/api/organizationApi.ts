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

export const organizationApi = {
    // Get user's organizations (GET /api/organizations/ returns organizations for authenticated user)
    async getUserOrganizations(): Promise<Organization[]> {
        const response = await apiClient.get('/organizations/');
        const allOrgs: Organization[] = response.data;
        
        // Get current user ID from localStorage
        const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        if (!userStr) return [];
        
        try {
            const user = JSON.parse(userStr);
            const currentUserId = user.id;
            
            // Filter organizations where user is creator or member
            const userOrgs = allOrgs.filter(org => 
                org.created_by === currentUserId || 
                (org.members && org.members.includes(currentUserId))
            );
            
            return userOrgs;
        } catch (error) {
            console.error('Error filtering user organizations:', error);
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
    }
};
