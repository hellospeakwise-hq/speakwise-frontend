import { apiClient } from './base';
import { Event } from '../types/api';

export interface CreateEventRequest {
  title: string;
  event_nickname?: string;
  short_description?: string;
  description?: string;
  website?: string;
  location?: string;
  start_date_time: string;
  end_date_time: string;
  is_active?: boolean;
  country?: number;
  tags?: number[];
  event_image?: string;
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
  async getEvent(id: string): Promise<Event> {
    const response = await apiClient.get<Event>(`/events/${id}/`);
    return response.data;
  },

  /**
   * Create new event
   */
  async createEvent(data: CreateEventRequest): Promise<Event> {
    const response = await apiClient.post<Event>('/events/', data);
    return response.data;
  },

  /**
   * Update event
   */
  async updateEvent(id: string, data: Partial<CreateEventRequest>): Promise<Event> {
    const response = await apiClient.patch<Event>(`/events/${id}/`, data);
    return response.data;
  },

  /**
   * Delete event
   */
  async deleteEvent(id: string): Promise<void> {
    await apiClient.delete(`/events/${id}/`);
  },

  /**
   * Get countries (extracted from events data)
   */
  async getCountries(): Promise<any[]> {
    try {
      const eventsResponse = await this.getEvents();
      const events = Array.isArray(eventsResponse) ? eventsResponse : (eventsResponse.results || []);
      
      // Extract unique countries from events
      const countryMap = new Map<number, any>();
      events.forEach(event => {
        if (event.location && typeof event.location === 'object' && event.location.country) {
          const country = event.location.country;
          countryMap.set(country.id, {
            id: country.id,
            name: country.name,
            code: country.code
          });
        }
      });
      
      return Array.from(countryMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error extracting countries from events:', error);
      throw error;
    }
  },

  /**
   * Get tags (extracted from events data)
   */
  async getTags(): Promise<any[]> {
    try {
      const eventsResponse = await this.getEvents();
      const events = Array.isArray(eventsResponse) ? eventsResponse : (eventsResponse.results || []);
      
      // Extract unique tags from events
      const tagMap = new Map<number, any>();
      events.forEach(event => {
        if (event.tags && Array.isArray(event.tags)) {
          event.tags.forEach(tag => {
            tagMap.set(tag.id, {
              id: tag.id,
              name: tag.name,
              color: tag.color
            });
          });
        }
      });
      
      return Array.from(tagMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error extracting tags from events:', error);
      throw error;
    }
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