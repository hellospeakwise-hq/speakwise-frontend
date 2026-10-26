'use client';

import React, { useState } from 'react';
import { BadgeDefinition, SPEAKWISE_BADGES_CONTRACT_ADDRESS } from '@/lib/contracts/badges';
import { AwardBadgeIcon } from './award-badge-icon';
import { 
  Mic, 
  Sparkles, 
  Users, 
  Plane, 
  Star, 
  Trophy, 
  Lock, 
  CheckCircle2, 
  ExternalLink,
  ShieldCheck,
  Loader2,
  Target,
  Check,
  Copy,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export type BadgeStatus = 'locked' | 'eligible' | 'minted';

interface BadgeCardProps {
  badge: BadgeDefinition;
  status: BadgeStatus;
  txHash?: string;
  claimedAt?: string;
  onClaim?: (badgeId: number) => Promise<void>;
  isClaiming?: boolean;
  isOwner?: boolean;
}

// Clean, restrained tier styling without flashy neon glows
const TIER_THEMES = {
  gold: {
    label: 'Gold Tier',
    border: 'border-amber-500/30 hover:border-amber-500/60',
    pill: 'bg-amber-500/10 border-amber-500/25 text-amber-400',
    dot: 'bg-amber-400',
    iconBox: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  },
  silver: {
    label: 'Silver Tier',
    border: 'border-slate-500/30 hover:border-slate-400/60',
    pill: 'bg-slate-400/10 border-slate-400/25 text-slate-300',
    dot: 'bg-slate-400',
    iconBox: 'bg-slate-400/10 border-slate-400/20 text-slate-200',
  },
  bronze: {
    label: 'Bronze Tier',
    border: 'border-amber-700/30 hover:border-amber-600/60',
    pill: 'bg-amber-700/10 border-amber-700/25 text-amber-500',
    dot: 'bg-amber-600',
    iconBox: 'bg-amber-600/10 border-amber-600/20 text-amber-500',
  },
};

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.77v8.37H6.46v-8.37M7.85 6.46a1.63 1.63 0 1 0 0 3.26 1.63 1.63 0 0 0 0-3.26z" />
    </svg>
  );
}

function BaseDot() {
  return <span className="w-1.5 h-1.5 rounded-full bg-[#0052FF] inline-block flex-shrink-0" title="Verified on Base" />;
}

export function BadgeCard({
  badge,
  status,
  txHash,
  claimedAt,
  onClaim,
  isClaiming = false,
  isOwner = true,
}: BadgeCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [copiedContract, setCopiedContract] = useState(false);

  const theme = TIER_THEMES[badge.tier] || TIER_THEMES.bronze;

  // Icon mapping - clean and properly sized
  const renderIcon = (className = "w-7 h-7") => {
    switch (badge.id) {
      case 1: return <Mic className={className} />;
      case 2: return <Sparkles className={className} />;
      case 3: return <Users className={className} />;
      case 4: return <Plane className={className} />;
      case 5: return <Star className={className} />;
      case 6: return <Trophy className={className} />;
      default: return <ShieldCheck className={className} />;
    }
  };

  const handleShareToTwitter = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const text = `I just earned the "${badge.name}" speaker badge on @SpeakWiseHQ!\n\nVerifiable proof of speaking impact.\n\nView my speaker credentials:`;
    const url = typeof window !== 'undefined' ? window.location.href : 'https://speakwise.app';
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareToLinkedIn = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const certUrl = txHash 
      ? `https://sepolia.basescan.org/tx/${txHash}` 
      : (typeof window !== 'undefined' ? window.location.href : 'https://speakwise.app');
    
    const orgId = "109397287";
    const orgName = "SpeakWise";
    const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(
      badge.name + ' - Verified Speaker'
    )}&organizationId=${orgId}&organizationName=${encodeURIComponent(orgName)}&certUrl=${encodeURIComponent(certUrl)}&certId=${encodeURIComponent(badge.code)}&issueYear=${new Date().getFullYear()}&issueMonth=${new Date().getMonth() + 1}`;
    window.open(linkedInUrl, '_blank', 'noopener,noreferrer');
  };


  const handleCopyContract = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(SPEAKWISE_BADGES_CONTRACT_ADDRESS);
    setCopiedContract(true);
    toast.success('Contract address copied');
    setTimeout(() => setCopiedContract(false), 2000);
  };

  // Determine what the user actually sees based on isOwner
  const isEarned = status === 'minted';
  const isReadyToClaim = status === 'eligible' && isOwner;
  const isLocked = status === 'locked' || (status === 'eligible' && !isOwner);

  return (
    <>
      <div 
        onClick={() => setIsDialogOpen(true)}
        className={`relative group rounded-2xl p-5 border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
          isEarned
            ? `bg-card border-border/80 hover:border-foreground/30 shadow-sm`
            : isReadyToClaim
            ? 'bg-card border-amber-500/40 hover:border-amber-500/70 shadow-sm'
            : 'bg-card/40 border-border/60 hover:border-border hover:bg-card/60'
        }`}
      >
        {/* Top Header: Tier Pill & Verification Status */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${theme.pill}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`} />
            <span>{badge.tier}</span>
          </div>

          {isEarned && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified Badge</span>
              <BaseDot />
            </div>
          )}

          {isReadyToClaim && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ready to Claim</span>
            </div>
          )}

          {isLocked && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/50 border border-border/50 text-muted-foreground text-xs font-medium">
              <Lock className="w-3 h-3" />
              <span>Locked</span>
            </div>
          )}
        </div>

        {/* Award Rosette / Medal Graphic */}
        <div className="flex flex-col items-center text-center my-2">
          <div className="relative mb-2 flex items-center justify-center min-h-[86px]">
            <AwardBadgeIcon 
              badgeId={badge.id} 
              tier={badge.tier} 
              isLocked={isLocked} 
              size={72} 
            />
          </div>

          {/* Badge Name & Description */}
          <div className="space-y-1 w-full">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              {badge.code}
            </div>
            <h3 className="text-base font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
              {badge.name}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 px-1">
              {badge.description}
            </p>
          </div>
        </div>

        {/* Requirement Card (Spacious Inset Box) */}
        <div className="mt-4 pt-3 border-t border-border/40 space-y-3">
          <div className="bg-muted/30 border border-border/50 rounded-xl p-3 flex flex-col gap-1.5 text-left">
            <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Target className="w-3 h-3 text-muted-foreground" />
                Requirement
              </span>
              {isEarned && (
                <span className="text-emerald-400 font-medium normal-case flex items-center gap-1">
                  <Check className="w-3 h-3" /> Completed
                </span>
              )}
              {isReadyToClaim && (
                <span className="text-amber-400 font-medium normal-case flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Ready
                </span>
              )}
              {isLocked && (
                <span className="text-muted-foreground font-medium normal-case">
                  Incomplete
                </span>
              )}
            </div>
            <p className="text-xs font-medium text-foreground leading-snug">
              {badge.criteriaDescription}
            </p>
          </div>

          {/* Action Row */}
          {isEarned && (
            <div className="space-y-2 pt-1" onClick={(e) => e.stopPropagation()}>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full text-xs h-8 rounded-lg border-border/70 hover:bg-muted font-medium flex items-center justify-center gap-1.5"
                  onClick={handleShareToTwitter}
                >
                  <XIcon className="w-3.5 h-3.5" />
                  <span>Share</span>
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full text-xs h-8 rounded-lg border-border/70 hover:bg-muted font-medium flex items-center justify-center gap-1.5"
                  onClick={handleShareToLinkedIn}
                >
                  <LinkedInIcon className="w-3.5 h-3.5 text-[#0A66C2]" />
                  <span>LinkedIn</span>
                </Button>
              </div>

              {txHash && (
                <a 
                  href={`https://sepolia.basescan.org/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors pt-0.5"
                >
                  <BaseDot />
                  <span>Verified on BaseScan</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          {/* Only the profile OWNER can claim an unlocked badge! */}
          {isReadyToClaim && (
            <div className="pt-1" onClick={(e) => e.stopPropagation()}>
              <Button 
                size="sm" 
                className="w-full text-xs h-8.5 rounded-lg bg-foreground text-background hover:bg-foreground/90 font-medium transition-all"
                disabled={isClaiming}
                onClick={() => onClaim && onClaim(badge.id)}
              >
                {isClaiming ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Claiming Badge...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                    Claim Badge
                  </>
                )}
              </Button>
            </div>
          )}

          {isLocked && (
            <div className="py-1.5 text-center">
              <span className="text-[11px] text-muted-foreground">
                {isOwner ? 'Complete requirement to unlock' : 'Locked milestone'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md sm:rounded-2xl border border-border/80 bg-card p-6">
          <DialogHeader className="space-y-2 text-center sm:text-center">
            <div className="mx-auto my-3 flex items-center justify-center">
              <AwardBadgeIcon 
                badgeId={badge.id} 
                tier={badge.tier} 
                isLocked={isLocked} 
                size={96} 
              />
            </div>

            <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider mx-auto border w-fit ${theme.pill}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`} />
              <span>{badge.tier} Tier</span>
            </div>

            <DialogTitle className="text-lg font-bold text-foreground">
              {badge.name}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
              {badge.description}
            </DialogDescription>
          </DialogHeader>

          {/* Specs Table */}
          <div className="space-y-2 my-2">
            <div className="bg-muted/30 border border-border/50 rounded-xl p-3.5 space-y-2.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-border/30">
                <span className="text-muted-foreground">Status</span>
                <span className={`font-medium ${
                  isEarned ? 'text-emerald-400' : isReadyToClaim ? 'text-amber-400' : 'text-muted-foreground'
                }`}>
                  {isEarned ? 'Earned & Verified' : isReadyToClaim ? 'Ready to Claim' : 'Locked'}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-border/30">
                <span className="text-muted-foreground">Network</span>
                <span className="font-medium text-foreground flex items-center gap-1.5">
                  <BaseDot />
                  Base Network
                </span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Target className="w-3 h-3" /> Requirement
                </span>
                <span className="font-medium text-foreground text-right max-w-[200px]">
                  {badge.criteriaDescription}
                </span>
              </div>
            </div>
          </div>

          {/* Dialog Action Buttons */}
          <div className="space-y-2 pt-2">
            {isEarned && (
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  size="sm" 
                  className="w-full text-xs h-8.5 rounded-lg font-medium flex items-center justify-center gap-1.5"
                  onClick={() => handleShareToTwitter()}
                >
                  <XIcon className="w-3.5 h-3.5" />
                  <span>Share on X</span>
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full text-xs h-8.5 rounded-lg font-medium flex items-center justify-center gap-1.5"
                  onClick={() => handleShareToLinkedIn()}
                >
                  <LinkedInIcon className="w-3.5 h-3.5 text-[#0A66C2]" />
                  <span>Add to LinkedIn</span>
                </Button>
              </div>
            )}

            {isReadyToClaim && (
              <Button 
                size="sm" 
                className="w-full text-xs h-9 rounded-lg bg-foreground text-background hover:bg-foreground/90 font-medium"
                disabled={isClaiming}
                onClick={() => {
                  if (onClaim) onClaim(badge.id);
                  setIsDialogOpen(false);
                }}
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                Claim Badge
              </Button>
            )}

            {txHash && (
              <a 
                href={`https://sepolia.basescan.org/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors pt-1"
              >
                <span>View Proof on BaseScan</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
