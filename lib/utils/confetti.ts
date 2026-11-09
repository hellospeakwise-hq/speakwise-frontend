import confetti from 'canvas-confetti';

/**
 * Curated, luxury celebration choreography for Web3 credential unlocks.
 * Designed with authentic stage-cannon pyrotechnics, atmospheric air-resistance,
 * and a tailored Base L2 Electric Blue + 24K Gold + Platinum Pearl palette.
 * Avoids generic AI rainbow spam in favor of an elegant, choreographed sequence.
 */
export function triggerLuxuryBadgeConfetti() {
  if (typeof window === 'undefined') return;

  const baseColors = ['#0052FF', '#2563EB', '#3B82F6', '#60A5FA'];
  const goldColors = ['#FFD700', '#F59E0B', '#FBBF24', '#FCD34D', '#D97706'];
  const pearlColors = ['#FFFFFF', '#F8FAFC', '#E2E8F0'];
  const luxuryPalette = [...baseColors, ...goldColors, ...pearlColors];

  // Base configuration ensuring top-layer visibility over modals
  const defaults: confetti.Options = {
    disableForReducedMotion: true,
    zIndex: 99999,
  };

  // --- ACT I: Dual Angled Stage Cannons (Left & Right) ---
  // Shoots upward and inward like stadium stage pyrotechnics
  confetti({
    ...defaults,
    particleCount: 45,
    angle: 60,
    spread: 60,
    origin: { x: 0.12, y: 0.88 },
    startVelocity: 55,
    decay: 0.92,
    gravity: 0.85,
    ticks: 280,
    scalar: 0.95,
    colors: luxuryPalette,
    shapes: ['square', 'circle'],
  });

  confetti({
    ...defaults,
    particleCount: 45,
    angle: 120,
    spread: 60,
    origin: { x: 0.88, y: 0.88 },
    startVelocity: 55,
    decay: 0.92,
    gravity: 0.85,
    ticks: 280,
    scalar: 0.95,
    colors: luxuryPalette,
    shapes: ['square', 'circle'],
  });

  // --- ACT II: Golden Star Shimmer Bloom (T + 180ms) ---
  // A warm upward bloom of golden stars and light circles in the center
  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 35,
      angle: 90,
      spread: 75,
      origin: { x: 0.5, y: 0.72 },
      startVelocity: 42,
      decay: 0.93,
      gravity: 0.75,
      ticks: 300,
      scalar: 1.1,
      colors: [...goldColors, '#FFFFFF'],
      shapes: ['star', 'circle'],
    });
  }, 180);

  // --- ACT III: Micro-Sparkle Fallout (T + 380ms) ---
  // Delicate fine particles drifting down gently like lingering celebration dust
  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 30,
      angle: 90,
      spread: 100,
      origin: { x: 0.5, y: 0.65 },
      startVelocity: 28,
      decay: 0.94,
      gravity: 0.6,
      drift: 0.05,
      ticks: 250,
      scalar: 0.7,
      colors: luxuryPalette,
      shapes: ['circle'],
    });
  }, 380);
}

