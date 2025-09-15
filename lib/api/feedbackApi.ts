// API client for SpeakWise backend - Feedback endpoints
const API_BASE_URL = 'http://127.0.0.1:8000/api';

export interface FeedbackData {
    session: number;
    attendee: number;
    overall_rating: number;
    engagement: number;
    clarity: number;
    content_depth: number;
    speaker_knowledge: number;
    practical_relevance: number;
    comment?: string | null;
    is_anonymous?: boolean;
    is_editable?: boolean;
}

export interface Feedback extends FeedbackData {
    id: number;
    created_at: string;
    updated_at: string;
}

export interface AttendeeVerification {
    email: string;
    event?: number;
}

class FeedbackAPI {
    // Verify attendee email against attendance list
    async verifyAttendee(email: string, eventId?: number): Promise<{ verified: boolean; message?: string }> {
        try {
            const response = await fetch(`${API_BASE_URL}/attendees/verify-attendee/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email.trim(),
                    ...(eventId && { event: eventId })
                }),
            });

            if (response.ok) {
                return { verified: true };
            } else {
                const errorText = await response.text();
                return {
                    verified: false,
                    message: errorText || "Attendee with the specified email does not exist"
                };
            }
        } catch (error) {
            console.error('Error verifying attendee:', error);
            return {
                verified: false,
                message: "Failed to verify attendance. Please try again."
            };
        }
    }

    // Submit feedback
    async submitFeedback(feedbackData: FeedbackData): Promise<Feedback> {
        try {
            const response = await fetch(`${API_BASE_URL}/feedbacks/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(feedbackData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to submit feedback');
            }

            return await response.json();
        } catch (error) {
            console.error('Error submitting feedback:', error);
            throw error;
        }
    }

    // Get feedback by ID
    async getFeedbackById(feedbackId: number): Promise<Feedback> {
        try {
            const response = await fetch(`${API_BASE_URL}/feedbacks/${feedbackId}/`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error fetching feedback ${feedbackId}:`, error);
            throw error;
        }
    }

    // Update feedback (within 24 hours)
    async updateFeedback(feedbackId: number, feedbackData: Partial<FeedbackData>): Promise<Feedback> {
        try {
            const response = await fetch(`${API_BASE_URL}/feedbacks/${feedbackId}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(feedbackData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to update feedback');
            }

            return await response.json();
        } catch (error) {
            console.error(`Error updating feedback ${feedbackId}:`, error);
            throw error;
        }
    }

    // Get all feedback (for speakers/organizers/admins)
    async getAllFeedback(): Promise<Feedback[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/feedbacks/`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching all feedback:', error);
            throw error;
        }
    }

    // Get feedback for a specific session
    async getSessionFeedback(sessionId: number): Promise<Feedback[]> {
        try {
            const allFeedback = await this.getAllFeedback();
            return allFeedback.filter(feedback => feedback.session === sessionId);
        } catch (error) {
            console.error(`Error fetching feedback for session ${sessionId}:`, error);
            throw error;
        }
    }

    // Get feedback for a specific speaker (across all their sessions)
    async getSpeakerFeedback(speakerId: number): Promise<Feedback[]> {
        try {
            // This would need to be implemented based on the relationship between speakers and sessions
            // For now, we'll need to fetch sessions by speaker first, then get feedback for those sessions
            const allFeedback = await this.getAllFeedback();
            // TODO: Filter by speaker's sessions once we have that relationship mapped
            return allFeedback;
        } catch (error) {
            console.error(`Error fetching feedback for speaker ${speakerId}:`, error);
            throw error;
        }
    }
}

// Create and export a singleton instance
export const feedbackAPI = new FeedbackAPI();
