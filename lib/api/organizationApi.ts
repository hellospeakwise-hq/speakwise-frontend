import { apiClient } from './base';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000';

function resolveImageUrl(path: string | null | undefined): string | null {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}${path}`;
}

export interface OrganizationCFP {
    url: string | null;
    description: string | null;
    open_at: string | null;
    close_at: string | null;
}

export type OrgStatus = 'pending' | 'active' | 'inactive' | 'rejected'

export interface OrganizationProfile {
    id: string;
    owner: string | null;
    name: string;
    description: string | null;
    website: string | null;
    branding: string | null;
    contact_email: string | null;
    status: OrgStatus | null;
    cfps: OrganizationCFP | null;
}

export interface CreateOrganizationData {
    name: string;
    description?: string;
    website?: string;
    contact_email?: string;
    branding?: File;
}

function resolveOrg(org: OrganizationProfile): OrganizationProfile {
    return { ...org, branding: resolveImageUrl(org.branding) };
}

export const organizationApi = {
    async listOrganizations(): Promise<OrganizationProfile[]> {
        const response = await apiClient.get<OrganizationProfile[]>('/organization/');
        const data = response.data;
        const list = Array.isArray(data) ? data : (data as any)?.results ?? [];
        return list.map(resolveOrg);
    },

    async getOrganization(id: string): Promise<OrganizationProfile> {
        const response = await apiClient.get<OrganizationProfile>(`/organization/${id}/`);
        return resolveOrg(response.data);
    },

    async createOrganization(data: CreateOrganizationData): Promise<OrganizationProfile> {
        const formData = new FormData();
        formData.append('name', data.name);
        if (data.description) formData.append('description', data.description);
        if (data.website) formData.append('website', data.website);
        if (data.contact_email) formData.append('contact_email', data.contact_email);
        if (data.branding) formData.append('branding', data.branding);
        const response = await apiClient.post<OrganizationProfile>('/organization/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return resolveOrg(response.data);
    },

    async updateOrganization(id: string, data: Partial<CreateOrganizationData>): Promise<OrganizationProfile> {
        const formData = new FormData();
        if (data.name) formData.append('name', data.name);
        if (data.description !== undefined) formData.append('description', data.description ?? '');
        if (data.website !== undefined) formData.append('website', data.website ?? '');
        if (data.contact_email !== undefined) formData.append('contact_email', data.contact_email ?? '');
        if (data.branding) formData.append('branding', data.branding);
        const response = await apiClient.put<OrganizationProfile>(`/organization/${id}/`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return resolveOrg(response.data);
    },

    async getMyOrganization(): Promise<OrganizationProfile | null> {
        try {
            const response = await apiClient.get<OrganizationProfile[]>('/organization/');
            const data = response.data;
            const list = Array.isArray(data) ? data : (data as any)?.results ?? [];
            const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
            const user = userStr ? JSON.parse(userStr) : null;
            const found = user?.id
                ? list.find((o: OrganizationProfile) => o.owner === user.id)
                : list[0] ?? null;
            return found ? resolveOrg(found) : null;
        } catch {
            return null;
        }
    },
};

export default organizationApi;
