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
        return response.data;
    },

    // Get single organization
    async getOrganization(id: number): Promise<Organization> {
        const response = await apiClient.get(`/organizations/${id}/`);
        return response.data;
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
