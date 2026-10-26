'use client';

import React, { useState } from 'react';
import { BADGE_DEFINITIONS, BadgeDefinition } from '@/lib/contracts/badges';
import { BadgeCard, BadgeStatus } from './badge-card';
import { Button } from '@/components/ui/button';
import { Sparkles, Trophy, ShieldCheck, CheckCircle2, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { useAccount } from 'wagmi';
import { WalletConnectButton } from './wallet-connect-button';
import { badgesApi } from '@/lib/api/badgesApi';
import { speakerApi } from '@/lib/api/speakerApi';
import { triggerLuxuryBadgeConfetti } from '@/lib/utils/confetti';
import { CredentialModal } from './credential-modal';



export interface UserBadgeState {
  badgeId: number;
  status: BadgeStatus;
  txHash?: string;
  claimedAt?: string;
}

interface BadgesGalleryProps {
  userBadges?: Record<number, UserBadgeState>;
  isOwner?: boolean;
  speakerSlug?: string;
  compact?: boolean;
}

// Default initial state: Badge #1 (Genesis) unlocked and ready to claim
const DEFAULT_USER_BADGES: Record<number, UserBadgeState> = {
  1: { 
    badgeId: 1, 
    status: 'eligible', 
  },
  2: { badgeId: 2, status: 'locked' },
  3: { badgeId: 3, status: 'locked' },
  4: { badgeId: 4, status: 'locked' },
  5: { badgeId: 5, status: 'locked' },
  6: { badgeId: 6, status: 'locked' },
};

export function BadgesGallery({ 
  userBadges = DEFAULT_USER_BADGES, 
  isOwner = true,
  speakerSlug,
  compact = false,
}: BadgesGalleryProps) {
  const { address } = useAccount();
  const [demoAddress, setDemoAddress] = useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setDemoAddress(localStorage.getItem('speakwise_demo_wallet'));
      const onWalletChange = () => {
        setDemoAddress(localStorage.getItem('speakwise_demo_wallet'));
      };
      window.addEventListener('speakwise-wallet-changed', onWalletChange);
      return () => window.removeEventListener('speakwise-wallet-changed', onWalletChange);
    }
  }, []);

  const activeWalletAddress = address || demoAddress;

  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'minted' | 'eligible' | 'locked'>('all');
  const [badgesState, setBadgesState] = useState<Record<number, UserBadgeState>>(userBadges);
  const [claimingId, setClaimingId] = useState<number | null>(null);
  const [celebrationBadge, setCelebrationBadge] = useState<BadgeDefinition | null>(null);
  const [celebrationTxHash, setCelebrationTxHash] = useState<string | undefined>(undefined);


  // Fetch real-time live speaker badge status from backend
  React.useEffect(() => {
    let isMounted = true;

    const loadBadges = async () => {
      let targetSlug = speakerSlug;
      if (!targetSlug) {
        try {
          const profile = await speakerApi.getProfile();
          targetSlug = profile.slug || profile.id;
        } catch {
          targetSlug = 'ahenkan-kwaku';
        }
      }

      if (!targetSlug) return;

      try {
        const badges = await badgesApi.getSpeakerBadges(targetSlug);
        if (!isMounted || !badges || badges.length === 0) return;
        const stateMap: Record<number, UserBadgeState> = {};
        badges.forEach((b) => {
          stateMap[b.badge.token_id] = {
            badgeId: b.badge.token_id,
            status: b.status === 'claimed' ? 'minted' : b.status === 'eligible' ? 'eligible' : 'locked',
            txHash: b.tx_hash || undefined,
            claimedAt: b.claimed_at || undefined,
          };
        });
        setBadgesState(stateMap);
      } catch (err) {
        console.warn('Could not fetch speaker badges from backend:', err);
      }
    };

    loadBadges();

    return () => {
      isMounted = false;
    };
  }, [speakerSlug]);


  const badgesList = Object.values(BADGE_DEFINITIONS);

  const bronzeCount = badgesList.filter((b) => b.tier === 'bronze').length;
  const silverCount = badgesList.filter((b) => b.tier === 'silver').length;
  const goldCount = badgesList.filter((b) => b.tier === 'gold').length;

  const mintedCount = Object.values(badgesState).filter(
    (b) => b.status === 'minted'
  ).length;

  const eligibleCount = Object.values(badgesState).filter(
    (b) => b.status === 'eligible'
  ).length;

  const filteredBadges = badgesList.filter((b) => {
    // Filter by tier
    if (selectedTier !== 'all' && b.tier !== selectedTier) {
      return false;
    }
    // Filter by status
    const state = badgesState[b.id] || { badgeId: b.id, status: 'locked' };
    if (statusFilter !== 'all' && state.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const handleClaimBadge = async (badgeId: number) => {
    if (!isOwner) return;

    if (!activeWalletAddress) {
      toast.error('Connect your wallet first', {
        description: 'Please connect MetaMask or Coinbase Wallet above to receive your on-chain badge.',
      });
      return;
    }

    setClaimingId(badgeId);
    try {
      // Execute Gasless Platform Mint via SpeakWise Relayer
      const response = await badgesApi.claimBadge({
        token_id: badgeId,
        recipient_address: activeWalletAddress,
        speaker_slug: speakerSlug,
      });

      const txHash = response.tx_hash || undefined;

      setBadgesState((prev) => ({
        ...prev,
        [badgeId]: {
          badgeId,
          status: 'minted',
          txHash: txHash,
          claimedAt: response.claimed_at || new Date().toISOString(),
        },
      }));

      const badgeName = BADGE_DEFINITIONS[badgeId]?.name || 'Badge';
      toast.success(`🎉 You minted the "${badgeName}" badge on Base!`, {
        description: 'Gasless platform mint confirmed. Your credential is now permanently on Base.',
      });

      // Trigger luxury stage celebration confetti
      triggerLuxuryBadgeConfetti();

      // Open credential showcase certificate modal
      setCelebrationBadge(BADGE_DEFINITIONS[badgeId] || null);
      setCelebrationTxHash(txHash);

      // Dispatch event to update navbar notifications
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event("speakwise-notifications-updated"));
      }

    } catch (error: any) {
      console.error('Badge claim error:', error);
      const detail = error?.response?.data?.detail || 'Failed to claim badge. Please try again.';
      toast.error(detail);
    } finally {
      setClaimingId(null);
    }
  };


  return (
    <div className="space-y-6">
      {/* ── Top Hero Banner (Retained structure without excessive glow) ─── */}
      {!compact && (
        <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 md:p-8">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-foreground">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>SpeakWise • Base Network</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                Verifiable Speaker Badges
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Earn permanent, non-transferable reputation credentials for speaking milestones, audience reviews, and organizer demand.
              </p>
            </div>

            {/* Quick Counter Card */}
            <div className="flex items-center gap-3.5 bg-muted/40 border border-border/60 rounded-xl p-4">
              <div className="w-10 h-10 rounded-lg bg-background border border-border/70 flex items-center justify-center text-foreground">
                <Trophy className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <div className="text-xl font-bold text-foreground">
                  {mintedCount} <span className="text-sm font-normal text-muted-foreground">/ {badgesList.length}</span>
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  Badges Earned
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Filter Bar ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-border/50">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Tier Tabs */}
          <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-xl border border-border/50">
            {[
              { id: 'all', label: 'All', count: badgesList.length },
              { id: 'bronze', label: 'Bronze', count: bronzeCount },
              { id: 'silver', label: 'Silver', count: silverCount },
              { id: 'gold', label: 'Gold', count: goldCount },
            ].map((tier) => (
              <button
                key={tier.id}
                onClick={() => setSelectedTier(tier.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all flex items-center gap-1.5 ${
                  selectedTier === tier.id
                    ? 'bg-card text-foreground shadow-sm border border-border/60'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>{tier.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  selectedTier === tier.id 
                    ? 'bg-muted text-foreground' 
                    : 'text-muted-foreground'
                }`}>
                  {tier.count}
                </span>
              </button>
            ))}
          </div>

          {/* Quick Filter: Show Earned */}
          {mintedCount > 0 && (
            <button
              onClick={() => setStatusFilter(statusFilter === 'minted' ? 'all' : 'minted')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                statusFilter === 'minted'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-muted/20 border-border/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Earned ({mintedCount})</span>
            </button>
          )}

          {isOwner && eligibleCount > 0 && (
            <button
              onClick={() => setStatusFilter(statusFilter === 'eligible' ? 'all' : 'eligible')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                statusFilter === 'eligible'
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                  : 'bg-muted/20 border-border/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Ready to Claim ({eligibleCount})</span>
            </button>
          )}
        </div>

        {/* Right side: Wallet Connect & Verification */}
        <div className="flex items-center gap-2.5">
          <WalletConnectButton />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-muted/40 border border-border/50 text-xs text-muted-foreground font-medium hover:text-foreground transition-colors">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Base Soulbound</span>
                  <Info className="w-3 h-3 text-muted-foreground/70" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs p-3 space-y-1">
                <p className="font-semibold text-foreground">Verified Credentials</p>
                <p className="text-muted-foreground leading-relaxed">
                  SpeakWise badges are recorded permanently on Base as non-transferable Soulbound tokens.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* ── Badges Grid ─────────────────────────────────────────────────── */}
      {filteredBadges.length > 0 ? (
        <div 
          className={
            compact 
              ? "grid grid-cols-1 md:grid-cols-2 gap-5" 
              : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          }
        >
          {filteredBadges.map((badge) => {
            const state = badgesState[badge.id] || { badgeId: badge.id, status: 'locked' };
            return (
              <BadgeCard
                key={badge.id}
                badge={badge}
                status={state.status}
                txHash={state.txHash}
                claimedAt={state.claimedAt}
                onClaim={handleClaimBadge}
                isClaiming={claimingId === badge.id}
                isOwner={isOwner}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-card border border-border/60 rounded-2xl p-6 space-y-3">
          <p className="text-sm font-semibold text-foreground">No badges match this filter</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs rounded-lg"
            onClick={() => {
              setSelectedTier('all');
              setStatusFilter('all');
            }}
          >
            Reset Filters
          </Button>
        </div>
      )}

      {/* Verified On-Chain Credential Showcase Modal */}
      <CredentialModal 
        badge={celebrationBadge}
        isOpen={!!celebrationBadge}
        onClose={() => setCelebrationBadge(null)}
        txHash={celebrationTxHash}
        recipientAddress={activeWalletAddress}
      />
    </div>
  );
}

