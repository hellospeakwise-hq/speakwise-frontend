import apiClient, { API_CONFIG } from './base';

// ─── Category choices (mirrors talks/choices.py) ──────────────────────────────
export const TALK_CATEGORIES = [
  { value: 'ai and ml',                 label: 'Artificial Intelligence & Machine Learning' },
  { value: 'cloud and devops',          label: 'Cloud Computing & DevOps' },
  { value: 'cybersecurity',             label: 'Cybersecurity & Privacy' },
  { value: 'data science',              label: 'Data Science & Analytics' },
  { value: 'frontend',                  label: 'Frontend Development' },
  { value: 'backend',                   label: 'Backend Development' },
  { value: 'fullstack',                 label: 'Full-Stack Development' },
  { value: 'mobile',                    label: 'Mobile Development' },
  { value: 'web',                       label: 'Web Development' },
  { value: 'devtools',                  label: 'DevTools & Productivity' },
  { value: 'programming languages',     label: 'Programming Languages' },
  { value: 'software architecture',     label: 'Software Architecture & Design' },
  { value: 'database',                  label: 'Database Technologies' },
  { value: 'blockchain',                label: 'Blockchain & Web3' },
  { value: 'iot',                       label: 'Internet of Things (IoT)' },
  { value: 'quantum computing',         label: 'Quantum Computing' },
  { value: 'open source',               label: 'Open Source & Community' },
  { value: 'agile',                     label: 'Agile & Project Management' },
  { value: 'emerging technologies',     label: 'Emerging Technologies' },
  { value: 'tech ethics',               label: 'Tech Ethics & Governance' },
] as const;

// ─── Types (mirrors TalkSerializer / TalkReviewCommentSerializer) ─────────────

export interface Talk {
  id: string;
  slug: string | null;
  title: string;
  description: string;
  speaker: string;               // FK UUID
  speaker_name: string;          // read-only from serializer method
  duration: number;              // minutes
  category: string;
  presentation_files: string | null;
  is_public: boolean;
  is_reviewable: boolean;
  event: string;                 // FK UUID
  session?: {
    id: string;
    type: string;
    duration: number;
  };
}

export interface TalkReview {
  id: string;          // UUID
  talk: string | null; // UUID
  rating: number;      // 1–5
  comment: string;
}

export interface CreateTalkData {
  title: string;
  description: string;
  duration: number;
  category: string;
  is_public?: boolean;
  is_reviewable?: boolean;
  /** Optional — only needed when the talk belongs to a specific event */
  event?: string;
}

export interface UpdateTalkData {
  title?: string;
  description?: string;
  duration?: number;
  category?: string;
  is_public?: boolean;
  is_reviewable?: boolean;
}

export interface SubmitReviewData {
  rating: number;   // 1–5
  comment: string;
}

// ─── Authenticated endpoints: GET /api/talks/ · CRUD /api/talks/<id>/ ─────────

export const talksApi = {
  /** List all talks (authenticated; backend returns all talks for the speaker) */
  async getMyTalks(): Promise<Talk[]> {
    const res = await apiClient.get('/talks/');
    return Array.isArray(res.data) ? res.data : res.data?.results ?? [];
  },

  /** Create a talk — POST /api/talks/ */
  async createTalk(data: CreateTalkData): Promise<Talk> {
    const res = await apiClient.post('/talks/', data);
    return res.data;
  },

  /** Full-update — PUT /api/talks/<id>/ */
  async updateTalk(id: string, data: UpdateTalkData): Promise<Talk> {
    const res = await apiClient.patch(`/talks/${id}/`, data);
    return res.data;
  },

  /** Delete — DELETE /api/talks/<id>/ */
  async deleteTalk(id: string): Promise<void> {
    await apiClient.delete(`/talks/${id}/`);
  },

  /** Reviews for a slug — GET /api/talks/<slug>/reviews/ (authenticated owner) */
  async getTalkReviews(slug: string): Promise<TalkReview[]> {
    const res = await apiClient.get(`/talks/${slug}/reviews/`);
    return Array.isArray(res.data) ? res.data : res.data?.results ?? [];
  },
};

// ─── Public endpoints (no auth) ───────────────────────────────────────────────

const BASE = `${API_CONFIG.BASE_URL}/api`;

export const publicTalksApi = {
  /** GET /api/talks/<slug>/  — only works if is_public=True */
  async getTalkBySlug(slug: string): Promise<Talk> {
    const res = await fetch(`${BASE}/talks/${slug}/`);
    if (!res.ok) throw new Error('Talk not found or not yet public');
    return res.json();
  },

  /** GET /api/talks/<slug>/reviews/  — public list */
  async getReviews(slug: string): Promise<TalkReview[]> {
    const res = await fetch(`${BASE}/talks/${slug}/reviews/`);
    if (!res.ok) throw new Error('Could not load reviews');
    const data = await res.json();
    return Array.isArray(data) ? data : data?.results ?? [];
  },

  /** POST /api/talks/<slug>/reviews/ — no auth, is_reviewable must be True */
  async submitReview(slug: string, payload: SubmitReviewData): Promise<TalkReview> {
    const res = await fetch(`${BASE}/talks/${slug}/reviews/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        err.detail || err.non_field_errors?.[0] || 'Submission failed'
      );
    }
    return res.json();
  },

  /** GET /api/speakers/<slug>/talks/ — public talks for a speaker */
  async getSpeakerPublicTalks(speakerSlug: string): Promise<Talk[]> {
    const res = await fetch(`${BASE}/speakers/${speakerSlug}/talks/`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : data?.results ?? [];
  },
};
