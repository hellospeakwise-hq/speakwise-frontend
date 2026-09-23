import { apiClient } from './base';
import { Event } from '../types/api';

export interface CreateEventRequest {
  title: string;
  event_nickname?: string;
  description?: string;
  website?: string;
  location?: string;
  country?: string;
  start_date_time: string;
  end_date_time: string;
  cfp_open?: boolean;
  cfp_link?: string;
  cfp_open_date?: string | null;
  cfp_deadline?: string | null;
  cfp_speaker_notification_date?: string | null;
  event_image?: File;
}

export interface EventsResponse {
  results: Event[];
  count: number;
  next: string | null;
  previous: string | null;
}

// Support both direct array and paginated response
export type EventsApiResponse = Event[] | EventsResponse;

export interface EventsParams {
  country?: string;
  region?: string;
  tags?: string[];
  search?: string;
  page?: number;
  limit?: number;
  // Supported by django-filters on the backend (events-qa+)
  event_nickname?: string;
  location?: string;
  slug?: string;
  submitted_by?: string;
  is_active?: boolean;
  cfp_open?: boolean;
  cfp_open_date?: string;
  cfp_deadline?: string;
  start_date_time?: string;
  end_date_time?: string;
}

// Events API service
export const eventsApi = {
  /**
   * Get all published events with broad filtering support.
   */
  async getEvents(params?: EventsParams): Promise<EventsApiResponse> {
    const response = await apiClient.get<EventsApiResponse>('/events/', { params });
    return response.data;
  },

  /**
   * Get events submitted by the current user (includes inactive/pending).
   * Uses the renamed /events/me/ endpoint (was /events/mine).
   */
  async getMyEvents(): Promise<Event[]> {
    const response = await apiClient.get<Event[]>('/events/me/');
    return Array.isArray(response.data) ? response.data : (response.data as any).results ?? [];
  },

  /**
   * Get a public event by slug (active events only).
   */
  async getEvent(slug: string): Promise<Event> {
    const response = await apiClient.get<Event>(`/events/${slug}/`);
    return response.data;
  },

  /**
   * Get the authenticated user's own event by slug.
   * Works for both active AND pending/inactive events — use this in organizer flows.
   */
  async getPrivateEvent(slug: string): Promise<Event> {
    const response = await apiClient.get<Event>(`/events/private/${slug}/`);
    return response.data;
  },

  /**
   * Build the JSON body for event creation/update.
   * Constructs the nested location and tags objects that the backend expects.
   */
  _buildJsonBody(data: CreateEventRequest | Partial<CreateEventRequest>): Record<string, any> {
    const body: Record<string, any> = {};

    if (data.title !== undefined) body.title = data.title;
    if (data.event_nickname !== undefined) body.event_nickname = data.event_nickname;
    if (data.description !== undefined) body.description = data.description;
    if (data.website !== undefined) body.website = data.website;
    if (data.location !== undefined) body.location = data.location;
    if (data.country !== undefined) body.country = data.country;
    if (data.start_date_time !== undefined) body.start_date_time = data.start_date_time;
    if (data.end_date_time !== undefined) body.end_date_time = data.end_date_time;
    if (data.cfp_open !== undefined) body.cfp_open = data.cfp_open;
    if (data.cfp_link !== undefined) body.cfp_link = data.cfp_link;
    if (data.cfp_open_date !== undefined) body.cfp_open_date = data.cfp_open_date || null;
    if (data.cfp_deadline !== undefined) body.cfp_deadline = data.cfp_deadline || null;
    if (data.cfp_speaker_notification_date !== undefined) body.cfp_speaker_notification_date = data.cfp_speaker_notification_date || null;

    return body;
  },

  /**
   * Upload event image via FormData PATCH to the private route.
   * Requires authentication — only the event owner or superuser can do this.
   */
  async _uploadEventImage(slug: string, imageFile: File): Promise<Event> {
    const formData = new FormData();
    formData.append('event_image', imageFile);
    const response = await apiClient.patch<Event>(`/events/private/${slug}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Create new event.
   * Step 1: POST JSON with event data (handles nested location/tags).
   * Step 2: If image provided, PATCH with FormData to upload the image.
   */
  async createEvent(data: CreateEventRequest): Promise<Event> {
    // Step 1: Create event with JSON body
    const jsonBody = this._buildJsonBody(data);
    console.log('Creating event with JSON body:', jsonBody);
    const response = await apiClient.post<Event>('/events/', jsonBody, {
      headers: { 'Content-Type': 'application/json' },
    });
    let savedEvent = response.data;

    // Step 2: Upload image if provided (use slug as the URL identifier)
    if (data.event_image && savedEvent.slug) {
      console.log('Uploading event image for event slug:', savedEvent.slug);
      savedEvent = await this._uploadEventImage(savedEvent.slug, data.event_image);
    }

    return savedEvent;
  },

  /**
   * Update the current user's own event via the private route.
   * Non-superusers cannot set is_active (backend strips it).
   * Step 1: PATCH JSON with event data.
   * Step 2: If image provided, PATCH with FormData to upload the image.
   */
  async updateEvent(slug: string, data: Partial<CreateEventRequest>): Promise<Event> {
    const imageFile = data.event_image;

    // Step 1: Update event data with JSON body via private route
    const jsonBody = this._buildJsonBody(data);
    console.log('Updating event with JSON body:', jsonBody);
    const response = await apiClient.patch<Event>(`/events/private/${slug}/`, jsonBody, {
      headers: { 'Content-Type': 'application/json' },
    });
    let savedEvent = response.data;

    // Step 2: Upload image if provided (use slug as the URL identifier)
    if (imageFile) {
      console.log('Uploading event image for event slug:', slug);
      savedEvent = await this._uploadEventImage(slug, imageFile);
    }

    return savedEvent;
  },

  /**
   * Delete the current user's own event via the private route.
   */
  async deleteEvent(slug: string): Promise<void> {
    await apiClient.delete(`/events/private/${slug}/`);
  },

};

export default eventsApi;