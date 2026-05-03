import { apiClient } from './base';
import { Event } from '../types/api';

export interface CreateEventRequest {
  title: string;
  event_nickname?: string;
  short_description?: string;
  description?: string;
  website?: string;
  location?: string; // venue/location name
  start_date_time: string;
  end_date_time: string;
  is_active?: boolean;
  country?: string; // country name
  country_code?: string; // ISO country code
  tags?: string[];
  event_image?: File; // actual file for upload
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
}

// Events API service
export const eventsApi = {
  /**
   * Get all events
   */
  async getEvents(params?: EventsParams): Promise<EventsApiResponse> {
    const response = await apiClient.get<EventsApiResponse>('/events/', { params });
    return response.data;
  },

  /**
   * Get single event
   */
  async getEvent(slug: string): Promise<Event> {
    const response = await apiClient.get<Event>(`/events/${slug}/`);
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
    if (data.short_description !== undefined) body.short_description = data.short_description;
    if (data.description !== undefined) body.description = data.description;
    if (data.website !== undefined) body.website = data.website;
    if (data.start_date_time !== undefined) body.start_date_time = data.start_date_time;
    if (data.end_date_time !== undefined) body.end_date_time = data.end_date_time;
    if (data.is_active !== undefined) body.is_active = data.is_active;

    // Build nested location object matching the backend schema:
    // { venue: "...", country: { name: "Ghana", code: "GH" } }
    if (data.location || data.country) {
      const locationObj: Record<string, any> = {};
      if (data.location) locationObj.venue = data.location;
      if (data.country) {
        locationObj.country = {
          name: data.country,
          ...(data.country_code ? { code: data.country_code } : {}),
        };
      }
      body.location = locationObj;
    }

    // Tags as array of objects with { id }
    if (data.tags && data.tags.length > 0) {
      body.tags = data.tags.map(tagId => ({ id: tagId }));
    }

    return body;
  },

  /**
   * Upload event image via FormData PATCH
   */
  async _uploadEventImage(slug: string, imageFile: File): Promise<Event> {
    const formData = new FormData();
    formData.append('event_image', imageFile);
    const response = await apiClient.patch<Event>(`/events/${slug}/`, formData, {
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
   * Update event.
   * Step 1: PATCH JSON with event data.
   * Step 2: If image provided, PATCH with FormData to upload the image.
   */
  async updateEvent(slug: string, data: Partial<CreateEventRequest>): Promise<Event> {
    const imageFile = data.event_image;

    // Step 1: Update event data with JSON body
    const jsonBody = this._buildJsonBody(data);
    console.log('Updating event with JSON body:', jsonBody);
    const response = await apiClient.patch<Event>(`/events/${slug}/`, jsonBody, {
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
   * Delete event
   */
  async deleteEvent(slug: string): Promise<void> {
    await apiClient.delete(`/events/${slug}/`);
  },

  /**
   * Get tags (extracted from events data)
   */
  async getTags(): Promise<any[]> {
    const response = await apiClient.get<any[]>('/events/tags/');
    return response.data;
  },

  /**
   * Create tag
   */
  async createTag(name: string, color?: string): Promise<any> {
    const response = await apiClient.post<any>('/events/tags/', { name, color });
    return response.data;
  },
};

export default eventsApi;