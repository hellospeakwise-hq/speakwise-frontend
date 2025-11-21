import { useState, useEffect } from 'react';

const ONBOARDING_KEYS = {
    PROFILE: 'onboarding_profile_completed',
    ORGANIZATIONS: 'onboarding_organizations_completed',
    ORGANIZER_DASHBOARD: 'onboarding_organizer_dashboard_completed',
};

export function useOnboarding(key: keyof typeof ONBOARDING_KEYS) {
    const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient) return;

        const storageKey = ONBOARDING_KEYS[key];
        const hasCompleted = localStorage.getItem(storageKey);

        if (!hasCompleted) {
            // Delay slightly to ensure page is fully rendered
            const timer = setTimeout(() => {
                setShouldShowOnboarding(true);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [key, isClient]);

    const completeOnboarding = () => {
        if (!isClient) return;
        const storageKey = ONBOARDING_KEYS[key];
        localStorage.setItem(storageKey, 'true');
        setShouldShowOnboarding(false);
    };

    const resetOnboarding = () => {
        if (!isClient) return;
        const storageKey = ONBOARDING_KEYS[key];
        localStorage.removeItem(storageKey);
        setShouldShowOnboarding(true);
    };

    return {
        shouldShowOnboarding,
        completeOnboarding,
        resetOnboarding,
    };
}
