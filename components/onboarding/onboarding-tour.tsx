"use client"

import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export interface TourStep {
  element: string;
  popover: {
    title: string;
    description: string;
    side?: 'top' | 'right' | 'bottom' | 'left';
    align?: 'start' | 'center' | 'end';
  };
}

interface OnboardingTourProps {
  steps: TourStep[];
  run: boolean;
  onComplete: () => void;
}

export function OnboardingTour({ steps, run, onComplete }: OnboardingTourProps) {
  useEffect(() => {
    if (!run || steps.length === 0) return;

    const driverObj = driver({
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      steps: steps,
      onDestroyStarted: () => {
        if (!driverObj.hasNextStep() || confirm('Are you sure you want to exit the tour?')) {
          driverObj.destroy();
          onComplete();
        }
      },
      onDestroyed: () => {
        onComplete();
      },
      popoverClass: 'driverjs-theme',
      progressText: '{{current}} of {{total}}',
      nextBtnText: 'Next →',
      prevBtnText: '← Back',
      doneBtnText: 'Finish 🎉',
    });

    // Small delay to ensure DOM is ready
    setTimeout(() => {
      driverObj.drive();
    }, 300);

    return () => {
      driverObj.destroy();
    };
  }, [run, steps, onComplete]);

  return null;
}
