import { apiClient } from './base';

export interface EventSchedule {
    id: string;
    event: string;
    sessions: string[];
}

export const eventScheduleApi = {
    // Returns a single schedule object (not an array)
    async getSchedule(eventSlug: string): Promise<EventSchedule | null> {
        try {
            const response = await apiClient.get<EventSchedule>(`/eventschedules/${eventSlug}/`);
            return response.data;
        } catch {
            return null;
        }
    },

    // POST auto-populates sessions from all sessions on the event
    async createSchedule(eventSlug: string): Promise<EventSchedule> {
        const response = await apiClient.post<EventSchedule>(`/eventschedules/${eventSlug}/`);
        return response.data;
    },

    async updateSchedule(scheduleId: string, data: Partial<EventSchedule>): Promise<EventSchedule> {
        const response = await apiClient.patch<EventSchedule>(`/eventschedules/${scheduleId}/`, data);
        return response.data;
    },

    async deleteSchedule(scheduleId: string): Promise<void> {
        await apiClient.delete(`/eventschedules/${scheduleId}/`);
    },
};
