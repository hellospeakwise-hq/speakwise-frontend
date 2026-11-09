import SpeakWiseBadgesABI from './SpeakWiseBadges.json';

export const BASE_SEPOLIA_CHAIN_ID = 84532;

// Deployed contract address on Base Sepolia (or local testnet)
export const SPEAKWISE_BADGES_CONTRACT_ADDRESS = 
  (process.env.NEXT_PUBLIC_BADGES_CONTRACT_ADDRESS as `0x${string}`) || 
  '0xDe534A43A2f1731bc86E776BAae4178be32B1DFE';


export { SpeakWiseBadgesABI };

export interface BadgeDefinition {
  id: number;
  code: string;
  name: string;
  description: string;
  tier: 'bronze' | 'silver' | 'gold';
  category: 'onboarding' | 'engagement' | 'influence';
  icon: string;
  gradient: string;
  criteriaDescription: string;
}

export const BADGE_DEFINITIONS: Record<number, BadgeDefinition> = {
  1: {
    id: 1,
    code: 'SPK_GENESIS_01',
    name: 'Genesis Speaker',
    description: 'Awarded to speakers who record and publish their first talk experience on SpeakWise.',
    tier: 'bronze',
    category: 'onboarding',
    icon: 'Microphone',
    gradient: 'from-amber-500/20 via-orange-500/20 to-amber-600/30 border-amber-500/40 text-amber-500',
    criteriaDescription: 'Post your 1st talk experience',
  },
  2: {
    id: 2,
    code: 'SPK_FIRST_REQUEST',
    name: 'In Demand',
    description: 'Awarded when an organizer finds and requests you as a speaker for their event.',
    tier: 'bronze',
    category: 'influence',
    icon: 'Sparkle',
    gradient: 'from-cyan-500/20 via-blue-500/20 to-indigo-600/30 border-cyan-500/40 text-cyan-400',
    criteriaDescription: 'Receive your 1st speaker request',
  },
  3: {
    id: 3,
    code: 'SPK_CROWD_5_SAME',
    name: 'Crowd Catalyst',
    description: 'Awarded when you collect 5 or more attendee reviews in a single speaking event.',
    tier: 'silver',
    category: 'engagement',
    icon: 'UsersThree',
    gradient: 'from-purple-500/20 via-pink-500/20 to-rose-600/30 border-purple-500/40 text-purple-400',
    criteriaDescription: 'Collect 5+ feedbacks in one event',
  },
  4: {
    id: 4,
    code: 'SPK_FEEDBACK_10_DIFF',
    name: 'Road Warrior',
    description: 'Proof of consistent speaking cadence and audience reception across 3+ distinct events.',
    tier: 'silver',
    category: 'engagement',
    icon: 'AirplaneTilt',
    gradient: 'from-emerald-500/20 via-teal-500/20 to-cyan-600/30 border-emerald-500/40 text-emerald-400',
    criteriaDescription: 'Collect 10+ feedbacks across multiple events',
  },
  5: {
    id: 5,
    code: 'SPK_CLARITY_HIGH',
    name: 'Five-Star Orator',
    description: 'Maintained an average clarity and knowledge score of 9.0+ across 10+ audience reviews.',
    tier: 'silver',
    category: 'engagement',
    icon: 'Star',
    gradient: 'from-yellow-400/20 via-amber-500/20 to-yellow-600/30 border-yellow-400/40 text-yellow-400',
    criteriaDescription: 'Maintain 9.0+ rating across 10+ reviews',
  },
  6: {
    id: 6,
    code: 'SPK_REQ_ACCEPTED_3',
    name: 'Keynote Pioneer',
    description: 'High-trust badge indicating reliable, verified completion of 3+ organizer event requests.',
    tier: 'gold',
    category: 'influence',
    icon: 'Trophy',
    gradient: 'from-amber-400/30 via-yellow-500/30 to-amber-600/40 border-amber-400/60 text-amber-300',
    criteriaDescription: 'Accept and complete 3+ event requests',
  },
};
