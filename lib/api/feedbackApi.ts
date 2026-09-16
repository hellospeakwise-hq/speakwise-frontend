// API client for SpeakWise backend — Feedback endpoints (feedback-refactor)
import apiClient, { API_CONFIG } from './base';

const BASE = `${API_CONFIG.BASE_URL}/api`;

// ─── Types matching the new backend serializers ───────────────────────────────

/** Inline experience summary returned inside every Feedback read row. */
export interface FeedbackExperience {
    feedback_slug: string;
    event_name: string;
    event_date: string;  // ISO date string e.g. "2024-10-15"
    topic: string;
}

/**
 * Shape returned by GET /api/feedbacks/
 * (FeedbackReadSerializer on the backend).
 */
export interface Feedback {
    id: string;
    experience: FeedbackExperience | null;
    speaker: string;           // SpeakerProfile UUID
    name: string;              // empty string when anonymous
    is_anonymous: boolean;
    overall_rating: number;    // 1–10
    engagement: number;        // 1–10
    clarity: number;           // 1–10
    content_depth: number;     // 1–10
    speaker_knowledge: number; // 1–10
    practical_relevance: number; // 1–10
    comments: string | null;
    created_at: string;        // ISO datetime
}

/**
 * Payload the audience submits to POST /api/feedbacks/rate/<feedback_slug>/
 * (FeedbackRateSerializer on the backend).
 */
export interface FeedbackSubmit {
    name?: string;              // optional; blank → anonymous
    comments?: string;
    overall_rating: number;    // 1–10
    engagement: number;        // 1–10
    clarity: number;           // 1–10
    content_depth: number;     // 1–10
    speaker_knowledge: number; // 1–10
    practical_relevance: number; // 1–10
}

/**
 * Audience-facing response after a successful POST
 * (FeedbackSubmittedSerializer — no UUIDs leak).
 */
export interface FeedbackSubmitted {
    experience: FeedbackExperience | null;
    name: string;
    is_anonymous: boolean;
    overall_rating: number;
    engagement: number;
    clarity: number;
    content_depth: number;
    speaker_knowledge: number;
    practical_relevance: number;
    comments: string | null;
    created_at: string;
}

// ─── API client ───────────────────────────────────────────────────────────────

// ─── Experience info (public, no auth) ───────────────────────────────────────

/** Public presentation context returned by GET /api/feedbacks/rate/<slug>/ */
export interface ExperienceInfo {
    topic: string;
    event_name: string;
    event_date: string;        // ISO date e.g. "2024-10-15"
    speaker_name: string;
    feedback_enabled: boolean;
    /** Whether the date gate allows submissions right now. */
    is_open: boolean;
}

class FeedbackAPI {
    /**
     * GET /api/feedbacks/rate/<feedback_slug>/
     * Public — returns presentation info for the audience landing page.
     */
    async getExperienceInfo(feedbackSlug: string): Promise<ExperienceInfo> {
        const response = await fetch(`${BASE}/feedbacks/rate/${feedbackSlug}/`);
        if (!response.ok) {
            throw new Error(`Presentation not found (${response.status})`);
        }
        return response.json();
    }

    /**
     * GET /api/feedbacks/
     * Returns the authenticated speaker's own feedback.
     * Pass an `experienceSlug` to filter to a single presentation.
     */
    async getCurrentSpeakerFeedback(experienceSlug?: string): Promise<Feedback[]> {
        const params = experienceSlug ? `?experience=${experienceSlug}` : '';
        const response = await apiClient.get(`/feedbacks/${params}`);
        return Array.isArray(response.data) ? response.data : response.data?.results ?? [];
    }

    /**
     * POST /api/feedbacks/rate/<feedback_slug>/
     * Public endpoint — no authentication required.
     * Throws an error with a user-friendly message for 403 / 429 / other errors.
     */
    async submitFeedback(feedbackSlug: string, data: FeedbackSubmit): Promise<FeedbackSubmitted> {
        const response = await fetch(`${BASE}/feedbacks/rate/${feedbackSlug}/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            const detail = err.detail ?? err.non_field_errors?.[0] ?? 'Something went wrong.';

            if (response.status === 403) {
                throw new FeedbackNotOpenError(detail);
            }
            if (response.status === 429) {
                throw new FeedbackCooldownError(detail);
            }
            throw new Error(detail);
        }

        return response.json();
    }

    /**
     * GET /api/feedbacks/qrcode/<feedback_slug>/
     * Requires email-verified speaker auth. Returns an image/png blob URL
     * the caller is responsible for revoking with URL.revokeObjectURL().
     */
    async getQRCodeBlobUrl(feedbackSlug: string): Promise<string> {
        try {
            const response = await apiClient.get(`/feedbacks/qrcode/${feedbackSlug}/`, {
                responseType: 'blob',
            });
            return URL.createObjectURL(response.data);
        } catch (error: any) {
            if (error?.response?.data instanceof Blob) {
                try {
                    const text = await error.response.data.text();
                    const parsed = JSON.parse(text);
                    if (parsed?.detail) {
                        throw new Error(parsed.detail);
                    }
                } catch (e: any) {
                    if (e.message && e.message !== error.message) {
                        throw e;
                    }
                }
            }
            throw error;
        }
    }
}

// ─── Typed errors for specific backend conditions ─────────────────────────────

/** Thrown when the backend returns 403 because feedback is not yet open or has been disabled. */
export class FeedbackNotOpenError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'FeedbackNotOpenError';
    }
}

/** Thrown when the backend returns 429 because the same IP submitted too recently. */
export class FeedbackCooldownError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'FeedbackCooldownError';
    }
}

// ─── Singleton export ─────────────────────────────────────────────────────────

export const feedbackAPI = new FeedbackAPI();
