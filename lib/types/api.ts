// TypeScript interfaces for the API responses

export interface Country {
  id: number;
  name: string;
  code: string;
}

export interface Location {
  id: number;
  country: Country;
  venue: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  latitude: string;
  longitude: string;
  description: string;
}

export interface DateTimeInfo {
  date: string;
  time: string;
  datetime: string;
}

export interface DateRange {
  start: DateTimeInfo;
  end: DateTimeInfo;
  same_day: boolean;
}

export interface Tag {
  id: number;
  name: string;
  color?: string;
}

export interface Event {
  id: number;
  event_image: string | null;
  tags: Tag[];
  website: string;
  short_description: string;
  location: Location | string;
  name: string;
  date: string; // Formatted display date
  date_range: DateRange;
  title: string;
  event_nickname: string;
  description: string;
  start_date_time: string; // ISO string
  end_date_time: string; // ISO string
  is_active: boolean;
  attendees?: number; // Number of attendees
  organizer: any | null; // Will be defined when organizer structure is known
}

export interface EventsListResponse {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: Event[];
}

// For backwards compatibility, support both array and paginated responses
export type EventsApiResponse = Event[] | EventsListResponse;
