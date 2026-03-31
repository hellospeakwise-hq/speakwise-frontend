import apiClient from './base';

export interface SpeakerRequest {
    id?: number;
    status: 'pending' | 'accepted' | 'rejected';
    message: string;
    organizer: string; // Organizer/Organization UUID
    organization: string; // Organization UUID
    speaker: number; // Speaker ID
    event: string; // Event UUID
    created_at?: string;
    updated_at?: string;
}

export interface CreateSpeakerRequestData {
    status?: 'pending';
    message: string;
    organizer: string;  // Backend expects 'organizer' (org UUID) for POST
    speaker: number;
    event: string; // Event UUID
}

export const speakerRequestApi = {
    // ORGANIZER ENDPOINTS - Manage speaker requests

    // Get all speaker requests (for organizers)
    // REQUIRED: Organization ID must be provided
    async getSpeakerRequests(organizationId: string): Promise<SpeakerRequest[]> {
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
            event: data.event, // UUID string — do NOT convert with Number()
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

    // Accept a speaker request (respond with status: 'accepted')
    async acceptSpeakerRequest(id: number): Promise<SpeakerRequest> {
        const response = await apiClient.patch(`/speaker-requests/${id}/respond/`, {
            status: 'accepted'
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
    },

    // EMAIL REQUEST ENDPOINTS - Request speakers via email (no org required)

    // Get email requests sent or received by the authenticated user
    async getEmailRequests(): Promise<EmailSpeakerRequest[]> {
        const response = await apiClient.get('/speaker-requests/email-requests/');
        return response.data;
    },

    // Create a new email speaker request
    async createEmailRequest(data: CreateEmailRequestData): Promise<EmailSpeakerRequest> {
        const requestData = {
            event: data.event,
            location: data.location,
            message: data.message,
            speaker_id: data.speaker_id,
        };
        console.log('Sending email speaker request with data:', requestData);
        const response = await apiClient.post('/speaker-requests/email-requests/', requestData);
        return response.data;
    },

    // Update an email speaker request status
    async updateEmailRequest(id: string, status: string): Promise<EmailSpeakerRequest> {
        const response = await apiClient.patch(`/speaker-requests/email-requests/${id}/`, { status });
        return response.data;
    },
};

// Email speaker request types
export interface EmailSpeakerRequest {
    id: string;  // UUID
    event: string;  // Event name (free text)
    location: string;
    message: string;
    status: 'pending' | 'accepted' | 'rejected';
    request_from: number;  // User ID
    request_to: number;    // User ID
    created_at?: string;
    updated_at?: string;
}

export interface CreateEmailRequestData {
    event: string;       // Event name (free text, not an FK)
    location: string;
    message: string;
    speaker_id: string;  // The speaker's user_account UUID
}
