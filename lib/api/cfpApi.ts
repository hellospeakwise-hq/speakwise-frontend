import apiClient from './base'

export type TalkType = 'short' | 'demo' | 'long'
export type AudienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'all'
export type CFPStatus = 'pending' | 'accepted' | 'rejected'

export const TALK_TYPE_LABELS: Record<TalkType, string> = {
    short: 'Short Talk',
    demo: 'Demo',
    long: 'Long Talk',
}

export const AUDIENCE_LABELS: Record<AudienceLevel, string> = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    all: 'All Levels',
}

export const CFP_CATEGORIES = [
    { value: 'ai and ml', label: 'AI & Machine Learning' },
    { value: 'cloud and devops', label: 'Cloud Computing & DevOps' },
    { value: 'cybersecurity', label: 'Cybersecurity & Privacy' },
    { value: 'data science', label: 'Data Science & Analytics' },
    { value: 'frontend', label: 'Frontend Development' },
    { value: 'backend', label: 'Backend Development' },
    { value: 'fullstack', label: 'Full-Stack Development' },
    { value: 'mobile', label: 'Mobile Development' },
    { value: 'web', label: 'Web Development' },
    { value: 'devtools', label: 'DevTools & Productivity' },
    { value: 'programming languages', label: 'Programming Languages' },
    { value: 'software architecture', label: 'Software Architecture & Design' },
    { value: 'database', label: 'Database Technologies' },
    { value: 'blockchain', label: 'Blockchain & Web3' },
    { value: 'iot', label: 'Internet of Things (IoT)' },
    { value: 'quantum computing', label: 'Quantum Computing' },
    { value: 'open source', label: 'Open Source & Community' },
    { value: 'agile', label: 'Agile & Project Management' },
    { value: 'emerging technologies', label: 'Emerging Technologies' },
    { value: 'tech ethics', label: 'Tech Ethics & Governance' },
]

export interface CFPSubmission {
    id: string
    event: string
    event_slug: string
    event_title: string
    submitter: string
    submitter_email: string
    title: string
    talk_type: TalkType
    duration: number | null
    audience: AudienceLevel
    category: string
    language: string
    elevator_pitch: string
    abstract: string
    outline: string
    slides_url: string | null
    recording_url: string | null
    co_speakers: string[]
    co_speakers_detail: { id: string; slug: string; name: string }[]
    other_speakers_text: string
    notes_for_organizers: string
    other_comments: string
    is_first_time_speaker: boolean
    travel_support_needed: boolean
    status: CFPStatus
}

export interface CFPReview {
    id: string
    submission: string
    reviewer: string
    reviewer_email: string
    reviewer_name: string
    score: number
    notes: string
    created_at: string
}

export interface CFPSubmissionWithScore extends CFPSubmission {
    avg_score: number | null
    review_count: number
    my_score: number | null
    reviews_detail: CFPReview[]
}

export interface CFPReviewQueueResponse {
    submission: CFPSubmissionWithScore
    progress: { reviewed: number; total: number }
}

export interface CreateCFPData {
    title: string
    talk_type: TalkType
    duration?: number | null
    audience: AudienceLevel
    category: string
    language?: string
    elevator_pitch: string
    abstract: string
    outline?: string
    slides_url?: string
    recording_url?: string
    co_speakers?: string[]
    other_speakers_text?: string
    notes_for_organizers?: string
    other_comments?: string
    is_first_time_speaker?: boolean
    travel_support_needed?: boolean
}

export const cfpApi = {
    async submitCFP(eventSlug: string, data: CreateCFPData): Promise<CFPSubmission> {
        const response = await apiClient.post(`/events/${eventSlug}/cfp/`, data)
        return response.data
    },

    async listCFPs(eventSlug: string): Promise<CFPSubmission[]> {
        const response = await apiClient.get(`/events/${eventSlug}/cfp/`)
        return response.data
    },

    async getCFP(id: string): Promise<CFPSubmission> {
        const response = await apiClient.get(`/cfp/${id}/`)
        return response.data
    },

    async updateCFP(id: string, data: Partial<CreateCFPData>): Promise<CFPSubmission> {
        const response = await apiClient.patch(`/cfp/${id}/`, data)
        return response.data
    },

    async myCFPs(): Promise<CFPSubmission[]> {
        const response = await apiClient.get('/cfp/mine/')
        return response.data
    },

    async deleteCFP(id: string): Promise<void> {
        await apiClient.delete(`/cfp/${id}/`)
    },

    async updateStatus(id: string, status: 'accepted' | 'rejected'): Promise<CFPSubmission> {
        const response = await apiClient.patch(`/cfp/${id}/status/`, { status })
        return response.data
    },

    async submitReview(id: string, score: number, notes?: string): Promise<CFPReview> {
        const response = await apiClient.post(`/cfp/${id}/review/`, { score, notes: notes ?? '' })
        return response.data
    },

    async listReviews(id: string): Promise<CFPReview[]> {
        const response = await apiClient.get(`/cfp/${id}/reviews/`)
        return response.data
    },

    async getReviewQueue(eventSlug: string): Promise<CFPReviewQueueResponse | null> {
        try {
            const response = await apiClient.get(`/events/${eventSlug}/cfp/review-queue/`)
            if (response.status === 204) return null
            return response.data
        } catch {
            return null
        }
    },
}
