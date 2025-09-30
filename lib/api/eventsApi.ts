// API client for SpeakWise backend
import { authenticatedAPI } from './authenticatedAPI'
import { authApiSimple } from './authApiSimple'

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export interface Tag {
    id: number;
    name: string;
    color: string;
}

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

export interface Event {
    id: number;
    event_image: string | null;
    tags: Tag[];
    website: string;
    short_description: string;
    location: Location;
    name: string;
    date: string; // Formatted display date
    date_range: DateRange;
    title: string;
    event_nickname: string;
    description: string;
    start_date_time: string; // ISO string
    end_date_time: string; // ISO string
    is_active: boolean;
    organizer: any | null;
}

export interface Region {
    id: number;
    name: string;
    countries: string[];
    created_at: string;
    updated_at: string;
}

export interface Country {
    id: number;
    name: string;
    region: {
        id: number;
        name: string;
        countries?: string[];
    };
    events?: string[];
    created_at: string;
    updated_at: string;
}

export interface CreateEventData {
    title: string
    event_nickname?: string
    short_description?: string
    description?: string
    website?: string
    location?: string
    start_date_time: string
    end_date_time: string
    is_active?: boolean
    event_image?: File | null
    country?: number // Foreign key to Country
    tags?: number[] // Array of tag IDs
}

// EventsAPI class with methods for fetching events
class EventsAPI {
    // Validate if file is a valid image by trying to load it
    private async validateImageFile(file: File): Promise<boolean> {
        return new Promise(async (resolve) => {
            // First check MIME type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
            if (!validTypes.includes(file.type)) {
                console.error('Invalid MIME type:', file.type)
                resolve(false)
                return
            }

            // Check file signature (magic numbers) for additional validation
            try {
                const isValidSignature = await this.validateFileSignature(file)
                if (!isValidSignature) {
                    console.error('Invalid file signature:', file.name)
                    resolve(false)
                    return
                }
            } catch (error) {
                console.error('Error checking file signature:', error)
                resolve(false)
                return
            }

            // Try to create an image to validate it's actually an image
            const img = new Image()
            const objectUrl = URL.createObjectURL(file)
            
            img.onload = () => {
                URL.revokeObjectURL(objectUrl)
                console.log('Image validation successful:', file.name, `${img.width}x${img.height}px`)
                resolve(true)
            }
            
            img.onerror = () => {
                URL.revokeObjectURL(objectUrl)
                console.error('Image validation failed:', file.name)
                resolve(false)
            }
            
            img.src = objectUrl
        })
    }

    // Validate file signature (magic numbers)
    private async validateFileSignature(file: File): Promise<boolean> {
        return new Promise((resolve) => {
            const reader = new FileReader()
            reader.onload = () => {
                const buffer = reader.result as ArrayBuffer
                const bytes = new Uint8Array(buffer)
                
                // Check for common image file signatures
                if (bytes.length < 4) {
                    resolve(false)
                    return
                }
                
                // JPEG: FF D8 FF
                if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
                    resolve(true)
                    return
                }
                
                // PNG: 89 50 4E 47 0D 0A 1A 0A
                if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
                    resolve(true)
                    return
                }
                
                // GIF: 47 49 46 38 (GIF8)
                if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
                    resolve(true)
                    return
                }
                
                // WebP: 52 49 46 46 (RIFF) and bytes 8-11: 57 45 42 50 (WEBP)
                if (bytes.length >= 12 && 
                    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
                    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
                    resolve(true)
                    return
                }
                
                console.error('Unknown file signature:', Array.from(bytes.slice(0, 12)).map(b => b.toString(16).padStart(2, '0')).join(' '))
                resolve(false)
            }
            
            reader.onerror = () => {
                console.error('Error reading file for signature validation')
                resolve(false)
            }
            
            // Read first 12 bytes to check file signature
            reader.readAsArrayBuffer(file.slice(0, 12))
        })
    }

    async getEvents(): Promise<Event[]> {
        try {
            console.log('Making API request to /api/events/')
            const response = await authenticatedAPI.get('/api/events/')
            console.log('API response received:', response)
            const data = response

            // Transform data to match frontend expectations
            return data.map((event: any) => ({
                ...event,
                name: event.title, // Alias title as name for frontend
                // Use short_description if available, otherwise use first part of description
                short_description: event.short_description || (event.description ? event.description.substring(0, 150) + '...' : ''),
                date: event.date || (event.start_date_time ? new Date(event.start_date_time).toLocaleDateString() : ''),
                attendees: event.attendees || 0,
                speakers: event.speakers || 0,
            }));
        } catch (error) {
            console.error('Error in getEvents:', error);
            throw error;
        }
    }

    // Create new event
    async createEvent(data: CreateEventData): Promise<Event> {
        try {
            console.log('Creating event with data:', data)
            
            // If we have an image, try a two-step process: create first, then update with image
            if (data.event_image instanceof File) {
                console.log('Two-step process: Creating event without image first, then updating with image')
                
                // Step 1: Create event without image
                const { event_image, ...dataWithoutImage } = data
                const createdEvent = await authenticatedAPI.post('/api/events/', dataWithoutImage)
                console.log('Event created without image:', createdEvent.id)
                
                // Step 2: Update with image
                try {
                    const updatedEvent = await this.updateEventImage(createdEvent.id, data.event_image)
                    console.log('Event updated with image successfully')
                    return updatedEvent
                } catch (imageError) {
                    console.warn('Failed to update with image, returning event without image:', imageError)
                    // If image update fails, return the event without image
                    return createdEvent
                }
            } else {
                                // Use regular JSON for text-only data (no image or null image)
                console.log('Using JSON for text-only data')
                const { event_image, ...dataWithoutImage } = data
                const response = await authenticatedAPI.post('/api/events/', dataWithoutImage)
                return response
            }
        } catch (error) {
            console.error('Error creating event:', error);
            throw error;
        }
    }

    // Helper method to update event with image
    private async updateEventImage(eventId: number, imageFile: File): Promise<Event> {
        // Validate the file before sending
        console.log('Updating event with image file details:', {
            name: imageFile.name,
            type: imageFile.type,
            size: imageFile.size,
            lastModified: imageFile.lastModified
        })
        
        const isValidImage = await this.validateImageFile(imageFile)
        if (!isValidImage) {
            throw new Error('Invalid image file detected. Please select a valid image.')
        }
        
        // Use FormData for file uploads
        const formData = new FormData()
        formData.append('event_image', imageFile, imageFile.name)

        console.log('Updating event with FormData containing image')

        // Use FormData for file uploads
        const response = await authenticatedAPI.postFormData(`/api/events/${eventId}/`, formData)
        return response
    }

    // Update event
    async updateEvent(id: number, data: Partial<CreateEventData>): Promise<Event> {
        try {
            console.log('Updating event with data:', data);
            
            // Format tags properly if provided
            const formattedData = { ...data };
            if (formattedData.tags) {
                console.log('Formatting tags for update:', formattedData.tags);
            }
            
            if (data.event_image instanceof File) {
                // Validate the file before sending
                const file = data.event_image
                console.log('Updating with image file details:', {
                    name: file.name,
                    type: file.type,
                    size: file.size
                })
                
                const isValidImage = await this.validateImageFile(file)
                if (!isValidImage) {
                    throw new Error('Invalid image file detected. Please select a valid image.')
                }
                
                // Use FormData for file uploads
                const formData = new FormData()
                Object.entries(data).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        if (key === 'event_image' && value instanceof File) {
                            formData.append(key, value)
                        } else if (key === 'tags' && Array.isArray(value)) {
                            // For tags, append each tag ID individually
                            formData.append('tags', JSON.stringify(value))
                        } else if (key !== 'event_image') {
                            formData.append(key, String(value))
                        }
                    }
                })

                // Use FormData for file uploads
                const response = await authenticatedAPI.postFormData(`/api/events/${id}/`, formData)
                return response
            } else {
                // Make sure tags are properly formatted
                const updatedData = { ...data };
                if (updatedData.tags && Array.isArray(updatedData.tags)) {
                    console.log('Formatting tags for update:', updatedData.tags);
                    // Ensure tags are just an array of IDs, not objects
                    updatedData.tags = updatedData.tags.map(tag => 
                        typeof tag === 'object' && tag !== null && 'id' in tag 
                            ? (tag as any).id 
                            : tag
                    );
                    console.log('Formatted tags:', updatedData.tags);
                }
                
                // Use regular JSON for text-only data
                const response = await authenticatedAPI.put(`/api/events/${id}/`, updatedData)
                return response
            }
        } catch (error) {
            console.error('Error updating event:', error);
            throw error;
        }
    }

    // Delete event
    async deleteEvent(id: number): Promise<void> {
        try {
            await authenticatedAPI.delete(`/api/events/${id}/`)
        } catch (error) {
            console.error('Error deleting event:', error);
            throw error;
        }
    }

    // Toggle event active status
    async toggleEventStatus(id: number, is_active: boolean): Promise<Event> {
        try {
            const response = await authenticatedAPI.put(`/api/events/${id}/`, {
                is_active
            })
            return response
        } catch (error) {
            console.error('Error toggling event status:', error);
            throw error;
        }
    }

    async getEventById(id: number): Promise<Event> {
        try {
            console.log(`Making authenticated API request to /api/events/${id}/`)
            const event = await authenticatedAPI.get(`/api/events/${id}/`);
            console.log('API response received for event:', event)
            console.log('Raw tags from API:', event.tags)

            // Ensure all required fields are present with proper formatting
            const formattedEvent = {
                ...event,
                id: event.id,
                title: event.title || '',
                name: event.title || '', // Alias title as name for frontend
                event_nickname: event.event_nickname || '',
                short_description: event.short_description || (event.description ? event.description.substring(0, 150) + '...' : ''),
                description: event.description || '',
                website: event.website || '',
                location: event.location || '',
                start_date_time: event.start_date_time || '',
                end_date_time: event.end_date_time || '',
                date: event.date || (event.start_date_time ? new Date(event.start_date_time).toLocaleDateString() : ''),
                is_active: event.is_active || false,
                attendees: event.attendees || 0,
                speakers: event.speakers || 0,
                created_at: event.created_at || '',
                updated_at: event.updated_at || '',
                // Ensure tags have the correct structure
                tags: Array.isArray(event.tags) ? event.tags.map((tag: any) => {
                    // If tag is just an ID, convert it to a full tag object
                    if (typeof tag === 'number') {
                        return { id: tag, name: `Tag ${tag}`, color: '#007bff' };
                    }
                    // If tag is an object but missing color, add a default color
                    if (typeof tag === 'object' && tag !== null) {
                        return {
                            id: tag.id,
                            name: tag.name || `Tag ${tag.id}`,
                            color: tag.color || '#007bff',
                        };
                    }
                    return tag;
                }) : [],
                country: event.country || null,
                event_image: event.event_image || null,
            };

            console.log('Formatted event for frontend:', formattedEvent);
            return formattedEvent;
        } catch (error) {
            console.error('Error fetching event:', error);
            throw error;
        }
    }

    getRegionsFromEvents(events: Event[]): Region[] {
        const regionMap = new Map<number, Region>();

        events.forEach(event => {
            if (event.country?.region) {
                const region = event.country.region;
                if (!regionMap.has(region.id)) {
                    regionMap.set(region.id, {
                        id: region.id,
                        name: region.name,
                        countries: region.countries || [],
                        created_at: '', //
                        updated_at: '', //
                    });
                }
            }
        });

        return Array.from(regionMap.values());
    }

    getCountriesFromEvents(events: Event[]): Country[] {
        const countryMap = new Map<number, Country>();

        events.forEach(event => {
            if (event.country) {
                const country = event.country;
                if (!countryMap.has(country.id)) {
                    countryMap.set(country.id, {
                        id: country.id,
                        name: country.name,
                        region: country.region,
                        events: country.events,
                        created_at: '', //
                        updated_at: '', //
                    });
                }
            }
        });

        return Array.from(countryMap.values());
    }

    getCountriesForRegion(events: Event[], regionId: number): Country[] {
        return this.getCountriesFromEvents(events).filter(
            country => country.region.id === regionId
        );
    }

    async getTags(): Promise<Tag[]> {
        try {
            console.log('Making authenticated API request to /api/events/tags/')
            const response = await authenticatedAPI.get('/api/events/tags/')
            console.log('API response received for tags:', response)
            
            // Ensure proper tag structure
            if (Array.isArray(response)) {
                return response.map(tag => ({
                    id: tag.id,
                    name: tag.name,
                    color: tag.color || '#007bff' // Default color if none provided
                }));
            }
            return response;
        } catch (error) {
            console.error('Error fetching tags:', error);
            throw error;
        }
    }

    async getCountries(): Promise<Country[]> {
        try {
            console.log('Making authenticated API request to /api/events/countries/')
            const response = await authenticatedAPI.get('/api/events/countries/')
            console.log('API response received for countries:', response)
            return response;
        } catch (error) {
            console.error('Error fetching countries:', error);
            throw error;
        }
    }

    async createTag(name: string, color: string = '#007bff'): Promise<Tag> {
        try {
            console.log('Creating new tag:', { name, color })
            // Make sure the authentication token is included and content type is set
            const response = await authenticatedAPI.post('/api/events/tags/', { 
                name, 
                color 
            })
            console.log('Tag created successfully:', response)
            // Ensure response has the expected Tag structure
            if (response && typeof response === 'object') {
                // Return properly structured tag object
                return {
                    id: response.id,
                    name: response.name,
                    color: response.color || color, // Use provided color as fallback
                };
            }
            return response;
        } catch (error) {
            console.error('Error creating tag:', error);
            throw error;
        }
    }

    async addTagToEvent(eventId: number, tagId: number): Promise<Event> {
        try {
            const event = await this.getEventById(eventId);
            
            // Check if the tag already exists in the event
            if (event.tags && event.tags.some(tag => tag.id === tagId)) {
                console.log(`Tag ${tagId} already exists in event ${eventId}, skipping addition`)
                return event;
            }

            // Get the full tag information if available
            let tagInfo: Tag | undefined;
            try {
                const allTags = await this.getTags();
                tagInfo = allTags.find(t => t.id === tagId);
                console.log('Found tag info:', tagInfo);
            } catch (error) {
                console.warn('Could not fetch full tag information:', error);
            }

            // Create a new array with existing tags and the new tag
            const updatedTags = [...(event.tags || [])];
            
            // Add the new tag with full information if available
            if (tagInfo) {
                updatedTags.push(tagInfo);
            } else {
                updatedTags.push({ id: tagId, name: `Tag ${tagId}`, color: '#007bff' });
            }
            
            console.log(`Updating event ${eventId} with new tags:`, updatedTags);
            
            // Send only the tag IDs array for the update
            const response = await authenticatedAPI.put(`/api/events/${eventId}/`, {
                tags: updatedTags.map(tag => tag.id)
            });
            
            console.log('Event updated with new tag, response:', response);
            
            // Return a properly formatted event with the updated tags
            return {
                ...response,
                tags: updatedTags
            };
        } catch (error) {
            console.error('Error adding tag to event:', error);
            throw error;
        }
    }

    async removeTagFromEvent(eventId: number, tagId: number): Promise<Event> {
        try {
            const event = await this.getEventById(eventId);
            
            // If no tags or tag doesn't exist, just return the event
            if (!event.tags || !event.tags.some(tag => tag.id === tagId)) {
                console.log(`Tag ${tagId} doesn't exist in event ${eventId}, nothing to remove`)
                return event;
            }

            // Filter out the tag to be removed
            const updatedTags = (event.tags || []).filter(tag => tag.id !== tagId);
            console.log(`Updating event ${eventId} to remove tag ${tagId}, remaining tags:`, updatedTags);
            
            // Send only the tag IDs array for the update
            const response = await authenticatedAPI.put(`/api/events/${eventId}/`, {
                tags: updatedTags.map(tag => tag.id)
            });
            
            console.log('Event updated after tag removal, response:', response);
            
            // Return a properly formatted event with the updated tags
            return {
                ...response,
                tags: updatedTags
            };
        } catch (error) {
            console.error('Error removing tag from event:', error);
            throw error;
        }
    }
}

// Create and export a singleton instance
export const eventsAPI = new EventsAPI();
