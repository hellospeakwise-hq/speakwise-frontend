// TypeScript interfaces for the API responses

export interface DateRange {
  start: string | null;
  end: string | null;
}

export interface Event {
  id: string;
  slug: string;
  title: string;
  event_nickname: string;
  event_image: string | null;
  description: string;
  website: string;
  location: string | null;
  date: string | null;
  date_range: DateRange;
  start_date_time: string;
  end_date_time: string;
  is_active: boolean;
  submitted_by: string | null;
  is_cfp_currently_open: boolean;
  // CFP configuration
  cfp_open: boolean;
  cfp_link: string;
  cfp_open_date: string | null;
  cfp_deadline: string | null;
  cfp_speaker_notification_date: string | null;
}

export interface EventsListResponse {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: Event[];
}

// For backwards compatibility, support both array and paginated responses
export type EventsApiResponse = Event[] | EventsListResponse;
