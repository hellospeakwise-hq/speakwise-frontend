import apiClient from './base';

export interface SpeakerRequest {
    id?: number;
    status: 'pending' | 'approved' | 'rejected';
    message: string;
    organizer: number; // Organizer ID (User)
    organization: number; // Organization ID
    speaker: number; // Speaker ID
    event: number; // Event ID
    created_at?: string;
    updated_at?: string;
}

export interface CreateSpeakerRequestData {
    status?: 'pending';
    message: string;
    organizer: number;  // Backend expects 'organizer' for POST
    speaker: number;
    event: number;
}

export const speakerRequestApi = {
    // ORGANIZER ENDPOINTS - Manage speaker requests

    // Get all speaker requests (for organizers)
    // REQUIRED: Organization ID must be provided
    async getSpeakerRequests(organizationId: number): Promise<SpeakerRequest[]> {
        const response = await apiClient.get('/speaker-requests/', {
            params: { organization: organizationId }
        });
        return response.data;
    },

    // Get a specific speaker request by ID
    async getSpeakerRequest(id: number): Promise<SpeakerRequest> {
        const response = await apiClient.get(`/speaker-requests/${id}/`);
        return response.data;
    },

    // Create a new speaker request (organizer invites speaker)
    async createSpeakerRequest(data: CreateSpeakerRequestData): Promise<SpeakerRequest> {
        const requestData = {
            organizer: data.organizer,
            speaker: data.speaker,
            event: data.event,
            message: data.message,
            status: data.status || 'pending'
        };
        console.log('Sending speaker request with data (body):', requestData);
        const response = await apiClient.post('/speaker-requests/', requestData);
        return response.data;
    },

    // Update speaker request
    async updateSpeakerRequest(id: number, data: Partial<SpeakerRequest>): Promise<SpeakerRequest> {
        const response = await apiClient.patch(`/speaker-requests/${id}/`, data);
        return response.data;
    },

    // Delete speaker request
    async deleteSpeakerRequest(id: number): Promise<void> {
        await apiClient.delete(`/speaker-requests/${id}/`);
    },

    // SPEAKER ENDPOINTS - View and respond to requests

    // Get incoming speaker requests for the authenticated speaker
    async getSpeakerIncomingRequests(): Promise<SpeakerRequest[]> {
        const response = await apiClient.get('/speaker-requests/incoming/');
        return response.data;
    },

    // Accept a speaker request (respond with status: 'approved')
    async acceptSpeakerRequest(id: number): Promise<SpeakerRequest> {
        const response = await apiClient.patch(`/speaker-requests/${id}/respond/`, {
            status: 'approved'
        });
        return response.data;
    },

    // Reject a speaker request (respond with status: 'rejected')
    async rejectSpeakerRequest(id: number): Promise<SpeakerRequest> {
        const response = await apiClient.patch(`/speaker-requests/${id}/respond/`, {
            status: 'rejected'
        });
        return response.data;
    },

    // Get details of a specific incoming request (for speakers)
    // Note: Backend doesn't have /speaker/speaker-requests/{id}/ endpoint yet,
    // so we use the general endpoint which works for both speakers and organizers
    async getSpeakerRequestDetails(id: number): Promise<SpeakerRequest> {
        const response = await apiClient.get(`/speaker-requests/${id}/`);
        return response.data;
    }
};
