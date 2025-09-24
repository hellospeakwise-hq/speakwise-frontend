
// Updated Event interface to match new API structure
export interface Event {
  id: number;
  event_image: string | null;
  tags: Array<{id: number; name: string; color?: string}>;
  website: string;
  short_description: string;
  location: {
    id: number;
    country: {
      id: number;
      name: string;
      code: string;
    };
    venue: string;
    address: string;
    city: string;
    state: string;
    postal_code: string;
    latitude: string;
    longitude: string;
    description: string;
  };
  name: string;
  date: string;
  date_range: {
    start: { date: string; time: string; datetime: string };
    end: { date: string; time: string; datetime: string };
    same_day: boolean;
  };
  title: string;
  event_nickname: string;
  description: string;
  start_date_time: string;
  end_date_time: string;
  is_active: boolean;
  organizer: any | null;
}

/**
 * Fetch all events from the API (via Next.js API route to avoid CORS)
 */
export async function fetchEvents(): Promise<Event[]> {
  try {
    console.log('Fetching events from Next.js API proxy route: /api/proxy/events');
    const response = await fetch(`/api/proxy/events`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Response data:', data);

    // Handle both direct array response and paginated response
    if (Array.isArray(data)) {
      return data as Event[];
    } else if (data && data.results && Array.isArray(data.results)) {
      return data.results as Event[];
    } else {
      console.error('Unexpected response format:', data);
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
}

/**
 * Fetch a single event by ID (via Next.js API route to avoid CORS)
 */
export async function fetchEventById(id: number): Promise<Event> {
  try {
    console.log('Fetching event by ID:', id);
    const response = await fetch(`/api/proxy/events/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Event fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('Error fetching event:', error);
    throw error;
  }
}

/**
 * Extract unique countries from events data
 */
export function extractCountriesFromEvents(events: Event[]): Array<{id: number; name: string; code: string}> {
  const countriesMap = new Map();
  
  events.forEach(event => {
    if (event.location?.country) {
      const country = event.location.country;
      if (!countriesMap.has(country.id)) {
        countriesMap.set(country.id, {
          id: country.id,
          name: country.name,
          code: country.code
        });
      }
    }
  });
  
  return Array.from(countriesMap.values());
}

/**
 * Extract unique tags from events data
 */
export function extractTagsFromEvents(events: Event[]): Array<{id: number; name: string; color?: string}> {
  const tagsMap = new Map();
  
  events.forEach(event => {
    if (event.tags && Array.isArray(event.tags)) {
      event.tags.forEach(tag => {
        if (!tagsMap.has(tag.id)) {
          tagsMap.set(tag.id, {
            id: tag.id,
            name: tag.name,
            color: tag.color
          });
        }
      });
    }
  });
  
  return Array.from(tagsMap.values());
}
