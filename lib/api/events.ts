
// Speaker interface for talks
export interface TalkSpeaker {
  id: number;
  full_name: string;
  organization?: string;
  avatar?: string;
}

// Event Talk/Session interface
export interface EventTalk {
  id: number;
  speaker_name: string;
  title: string;
  description: string;
  duration: number; // in hours/minutes
  category: string;
  presentation_files: string | null;
  speaker: number; // speaker ID
  event: number; // event ID
}

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
    const response = await fetch(`/api/proxy/events/detail/${id}`, {
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

/**
 * Fetch speaker details by ID using the proxy
 */
export async function fetchSpeakerById(speakerId: number): Promise<TalkSpeaker> {
  try {
    console.log(`Fetching speaker details for ID: ${speakerId}`);
    const response = await fetch(`/api/proxy/speakers/${speakerId}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      id: data.id,
      full_name: data.full_name,
      organization: data.organization,
      avatar: data.avatar
    };
  } catch (error) {
    console.error('Error fetching speaker:', error);
    throw error;
  }
}

/**
 * Fetch talks/sessions for a specific event
 */
export async function fetchEventTalks(eventId: string): Promise<EventTalk[]> {
  try {
    console.log(`Fetching talks for event ID: ${eventId}`);
    const response = await fetch(`/api/proxy/talks/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Event talks response data:', data);
    
    // Handle both direct array response and paginated response
    let allTalks: EventTalk[] = [];
    if (Array.isArray(data)) {
      allTalks = data as EventTalk[];
    } else if (data && data.results && Array.isArray(data.results)) {
      allTalks = data.results as EventTalk[];
    } else {
      console.error('Unexpected response format:', data);
      return [];
    }
    
    // Filter talks by eventId
    const eventIdNumber = parseInt(eventId);
    const filteredTalks = allTalks.filter(talk => talk.event === eventIdNumber);
    console.log(`Filtered ${filteredTalks.length} talks for event ${eventId}`);
    
    return filteredTalks;
  } catch (error) {
    console.error('Error fetching event talks:', error);
    throw error;
  }
}
