"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, type LoginResponse } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';
import { scheduleTokenRefresh, cancelTokenRefresh, initializeTokenRefresh, setSessionCallbacks } from '@/lib/utils/tokenRefresh'
import { SessionExpiryDialog } from '@/components/auth/session-expiry-dialog';
import { ProfileTypeModal } from '@/components/auth/profile-type-modal';

type User = {
    id: string;
    speaker_id?: string;
    first_name: string;
    last_name: string;
    email: string;
    role: {
        id: string;
        role: 'attendee' | 'speaker' | 'organizer' | 'admin';
    };
    userType: 'attendee' | 'speaker' | 'organizer' | 'admin';
}

interface AuthContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    loading: boolean;
    login: (email: string, password: string) => Promise<string>;
    register: (firstName: string, lastName: string, nationality: string, username: string, email: string, password: string) => Promise<string>;
    verifyOtp: (email: string, otp: string) => Promise<void>;
    resendOtp: (email: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeRole = (value?: string | null): User['userType'] => {
    if (value === 'organizer' || value === 'speaker' || value === 'admin') {
        return value;
    }
    return 'speaker';
};

const resolveServerProfileType = (response: LoginResponse): 'speaker' | 'organization' | null => {
    const profiles = response.profile ?? response.profiles ?? {};
    if (profiles.speaker_profile) return 'speaker';
    if (profiles.organization_profile) return 'organization';
    return null;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    // Initialize state from localStorage immediately (before render)
    const [user, setUser] = useState<User | null>(() => {
        if (typeof window === 'undefined') return null;
        const storedUser = localStorage.getItem('user');
        try {
            return storedUser ? JSON.parse(storedUser) : null;
        } catch {
            return null;
        }
    });

    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        const hasToken = !!localStorage.getItem('accessToken');
        const hasUser = !!localStorage.getItem('user');
        return hasToken && hasUser;
    });

    // Start as true so no component renders until checkAuth() has resolved the user's real role/profile_type.
    // This prevents the speaker-dashboard flash for org users.
    const [loading, setLoading] = useState<boolean>(true);
    const [showExpiryWarning, setShowExpiryWarning] = useState(false);
    const [showProfileTypeModal, setShowProfileTypeModal] = useState(false);
    const router = useRouter();

    // Check if user is already logged in on initial load
    useEffect(() => {
        const checkAuth = async () => {
            const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
            const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
            console.log('[Auth] checkAuth start', { hasAccess: !!accessToken, hasRefresh: !!refreshToken });
            
            if (authApi.isAuthenticated()) {
                // Initialize automatic token refresh for existing session
                initializeTokenRefresh();

                // Always use stored user data first
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    try {
                        const userData = JSON.parse(storedUser);
                        const savedProfileType = localStorage.getItem('profile_type');
                        const storedRole = normalizeRole(
                            savedProfileType === 'organization'
                                ? 'organizer'
                                : savedProfileType === 'speaker'
                                    ? 'speaker'
                                    : userData.role?.role || userData.userType
                        );
                        const normalizedUser = {
                            ...userData,
                            role: { ...(userData.role || {}), id: userData.role?.id || userData.id, role: storedRole },
                            userType: storedRole
                        };
                        setUser(normalizedUser);
                        localStorage.setItem('user', JSON.stringify(normalizedUser));
                        setIsAuthenticated(true);
                    } catch (parseError) {
                        console.error('Error parsing stored user', parseError);
                    }
                }

                // Try to get fresh user profile from API in the background
                try {
                    const userProfile = await authApi.getProfile();
                    const storedUserData = storedUser ? JSON.parse(storedUser) : {};
                    const savedProfileType = localStorage.getItem('profile_type');
                    const resolvedRole = normalizeRole(
                        userProfile.role?.role ||
                        userProfile.userType ||
                        (savedProfileType === 'organization' ? 'organizer' : savedProfileType === 'speaker' ? 'speaker' : null) ||
                        storedUserData.role?.role ||
                        storedUserData.userType
                    );
                    const userWithType = {
                        ...storedUserData,
                        ...userProfile,
                        userType: resolvedRole,
                        role: userProfile.role ?? { id: userProfile.id, role: resolvedRole }
                    };
                    setUser(userWithType);
                    setIsAuthenticated(true);
                    localStorage.setItem('user', JSON.stringify(userWithType));
                } catch (error: any) {
                    console.warn('[Auth] getProfile failed', error?.response?.status, error?.response?.data);
                    // Treat a missing profile endpoint response differently from other auth failures.
                    if (error?.response?.status !== 404) {
                        console.error('Error validating authentication', error);
                    }
                    // If no stored user exists, logout
                    const storedUser = localStorage.getItem('user');
                    if (!storedUser) {
                        await authApi.logout();
                        setIsAuthenticated(false);
                        setUser(null);
                    }
                    // Otherwise, continue with stored user data (404 is expected during development)
                }

                if (sessionStorage.getItem('showProfileTypeModal') === 'true') {
                    sessionStorage.removeItem('showProfileTypeModal');
                    setShowProfileTypeModal(true);
                }
            } else {
                console.log('[Auth] not authenticated (no access token)');
                setIsAuthenticated(false);
                setUser(null);
            }
            console.log('[Auth] checkAuth end', { isAuthenticated });
            setLoading(false);
        };
        
        checkAuth();
    }, []);

    useEffect(() => {
        setSessionCallbacks(
            () => setShowExpiryWarning(true),
            () => {
                setUser(null);
                setIsAuthenticated(false);
                setShowExpiryWarning(false);
                router.push('/signin?session=expired');
            }
        );
    }, [router]);

    const login = async (email: string, password: string) => {
        setLoading(true);
        try {
            const response = await authApi.login({ email, password });
            console.log('Login API Response:', response);
            setIsAuthenticated(true);

            // Store tokens from the response (access and refresh)
            if (response.access_token || response.access) {
                const accessToken = response.access_token || response.access;
                if (accessToken && typeof window !== 'undefined') {
                    localStorage.setItem('accessToken', accessToken);
                    console.log('[Auth] stored accessToken');
                }
            }

            if (response.refresh_token || response.refresh) {
                const refreshToken = response.refresh_token || response.refresh;
                if (refreshToken && typeof window !== 'undefined') {
                    localStorage.setItem('refreshToken', refreshToken);
                    console.log('[Auth] stored refreshToken');
                }
            }

            const serverProfileType = resolveServerProfileType(response);
            const resolvedRole = serverProfileType === 'organization'
                ? 'organizer'
                : serverProfileType === 'speaker'
                    ? 'speaker'
                    : normalizeRole(response.role?.role || null);

            const userData: User = {
                id: response.id,
                speaker_id: response.speaker_id,
                first_name: response.first_name,
                last_name: response.last_name,
                email: response.email,
                role: response.role || { id: response.id, role: resolvedRole },
                userType: resolvedRole
            };

            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));

            // Start automatic token refresh
            scheduleTokenRefresh();
            console.log('[Auth] scheduled token refresh');

            // Sync profile type from the backend response so it stays authoritative.
            const profiles = response.profile || response.profiles || {};
            const hasSpeakerProfile = !!profiles.speaker_profile;
            const hasOrgProfile = !!profiles.organization_profile;

            if (hasSpeakerProfile) {
                localStorage.setItem('profile_type', 'speaker');
                if (profiles.speaker_profile?.slug) {
                    const stored = JSON.parse(localStorage.getItem('user') || '{}');
                    localStorage.setItem('user', JSON.stringify({ ...stored, speaker_slug: profiles.speaker_profile.slug }));
                }
            } else if (hasOrgProfile) {
                localStorage.setItem('profile_type', 'organization');
                localStorage.setItem('cached_org_profile', JSON.stringify(profiles.organization_profile));
            } else {
                localStorage.removeItem('profile_type');
            }

            const isNewSignup = typeof window !== 'undefined' && sessionStorage.getItem('showProfileTypeModal') === 'true';
            if (!hasSpeakerProfile && !hasOrgProfile) {
                sessionStorage.removeItem('showProfileTypeModal');
                setShowProfileTypeModal(true);
                return '/';
            }

            // Clear stale flag if they somehow already have a profile
            if (isNewSignup) sessionStorage.removeItem('showProfileTypeModal');

            return getRoleBasedRedirectPath(userData);
        } finally {
            setLoading(false);
        }
    };

    // Helper function to determine where to redirect users based on role
    const getRoleBasedRedirectPath = (user: User) => {
        // Check for a saved redirect path first
        const savedRedirect = typeof window !== 'undefined' ? sessionStorage.getItem('redirectAfterLogin') : null;

        if (savedRedirect && !savedRedirect.startsWith('/dashboard/attendee')) {
            // Clear the stored redirect
            sessionStorage.removeItem('redirectAfterLogin');
            return savedRedirect;
        }
        if (savedRedirect) sessionStorage.removeItem('redirectAfterLogin');

        const userRole = normalizeRole(user.role?.role || user.userType || null);
        const storedProfileType = typeof window !== 'undefined' ? localStorage.getItem('profile_type') : null;
        const effectiveProfileType = storedProfileType;

        if (effectiveProfileType === 'organization') {
            return '/dashboard/organizer';
        }
        if (effectiveProfileType === 'speaker') {
            return '/dashboard/speaker';
        }

        switch (userRole) {
            case 'speaker':
                return '/dashboard/speaker';
            case 'organizer':
                return '/dashboard/organizer';
            default:
                return '/dashboard/speaker';
        }
    };

    const register = async (
        firstName: string,
        lastName: string,
        nationality: string,
        username: string,
        email: string,
        password: string
    ): Promise<string> => {
        setLoading(true);
        try {
            console.log("Attempting registration with:", { first_name: firstName, last_name: lastName, nationality, username, email });
            await authApi.register({
                first_name: firstName,
                last_name: lastName,
                nationality,
                username,
                email,
                password
            });

            // Return the email so the sign-up form can pass it to the OTP screen
            return email;
        } catch (error) {
            console.error("Registration error in context:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async (email: string, otp: string): Promise<void> => {
        await authApi.verifyOtp({ email, otp });
    };

    const resendOtp = async (email: string): Promise<void> => {
        await authApi.resendOtp({ email });
    };

    const logout = async () => {
        setLoading(true);
        try {
            // Cancel automatic token refresh
            cancelTokenRefresh();

            await authApi.logout();
            setUser(null);
            setIsAuthenticated(false);
            router.push('/signin');
        } finally {
            setLoading(false);
        }
    };

    const navigateAfterProfileTypeSelection = (dashboardPath: string) => {
        if (sessionStorage.getItem('oauthProfileSetup') === 'true') {
            sessionStorage.removeItem('oauthProfileSetup');
            router.push('/profile?setup=welcome');
            return;
        }
        router.push(dashboardPath);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, login, register, verifyOtp, resendOtp, logout, isAuthenticated }}>
            {children}
            <SessionExpiryDialog
                open={showExpiryWarning}
                onStayLoggedIn={() => setShowExpiryWarning(false)}
                onLoggedOut={() => {
                    setUser(null);
                    setIsAuthenticated(false);
                    setShowExpiryWarning(false);
                    router.push('/signin?session=expired');
                }}
            />
            <ProfileTypeModal
                open={showProfileTypeModal}
                onSpeakerChosen={() => {
                    if (user) {
                        const speakerUser = {
                            ...user,
                            role: { id: user.id, role: 'speaker' as const },
                            userType: 'speaker' as const
                        };
                        setUser(speakerUser);
                        localStorage.setItem('user', JSON.stringify(speakerUser));
                    }
                    setShowProfileTypeModal(false);
                    navigateAfterProfileTypeSelection('/dashboard/speaker');
                }}
                onOrgChosen={() => {
                    if (user) {
                        const organizerUser = {
                            ...user,
                            role: { id: user.id, role: 'organizer' as const },
                            userType: 'organizer' as const
                        };
                        setUser(organizerUser);
                        localStorage.setItem('user', JSON.stringify(organizerUser));
                    }
                    setShowProfileTypeModal(false);
                    navigateAfterProfileTypeSelection('/dashboard/organizer');
                }}
            />
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
