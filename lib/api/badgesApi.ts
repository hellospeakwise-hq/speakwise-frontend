import { apiClient } from './base';

export interface BackendBadgeDefinition {
  token_id: number;
  name: string;
  slug: string;
  description: string;
  tier: 'bronze' | 'silver' | 'gold';
  icon: string;
  emoji: string;
  criteria: string;
  metric_type: string;
  metric_threshold: string;
}

export interface BackendSpeakerBadge {
  id: string;
  badge: BackendBadgeDefinition;
  status: 'locked' | 'eligible' | 'claimed';
  tx_hash?: string | null;
  recipient_address?: string | null;
  network: string;
  unlocked_at: string;
  claimed_at?: string | null;
  basescan_url?: string | null;
}

export interface ClaimBadgePayload {
  token_id: number;
  recipient_address: string;
  tx_hash?: string;
  speaker_slug?: string;
}


export const badgesApi = {
  /**
   * Fetch all badge definitions catalog
   */
  async getBadgeDefinitions(): Promise<BackendBadgeDefinition[]> {
    const response = await apiClient.get<BackendBadgeDefinition[]>('/badges/definitions/');
    return response.data;
  },

  /**
   * Fetch a speaker's badges with eligibility status and on-chain proofs
   */
  async getSpeakerBadges(slugOrId: string): Promise<BackendSpeakerBadge[]> {
    const response = await apiClient.get<BackendSpeakerBadge[]>(`/speakers/${slugOrId}/badges/`);
    return response.data;
  },

  /**
   * Record an on-chain mint claim for an eligible badge
   */
  async claimBadge(payload: ClaimBadgePayload): Promise<BackendSpeakerBadge> {
    const response = await apiClient.post<BackendSpeakerBadge>('/badges/claim/', payload);
    return response.data;
  },
};
