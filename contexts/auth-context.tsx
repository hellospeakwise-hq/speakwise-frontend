"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, type AuthResponse } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';
import { scheduleTokenRefresh, cancelTokenRefresh, initializeTokenRefresh } from '@/lib/utils/tokenRefresh';

type User = {
    id: string;
    speaker_id?: number;
    first_name: string;
    last_name: string;
    email: string;
    role: {
        id: number;
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
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

    const [loading, setLoading] = useState<boolean>(false);
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
                        setUser(userData);
                        setIsAuthenticated(true);
                    } catch (parseError) {
                        console.error('Error parsing stored user', parseError);
                    }
                }

                // Try to get fresh user profile from API in the background
                try {
                    const userProfile = await authApi.getProfile();
                    // Safely handle missing role property
                    const userWithType = {
                        ...userProfile,
                        userType: userProfile.role?.role || 'speaker'
                    };
                    setUser(userWithType);
                    setIsAuthenticated(true);
                    localStorage.setItem('user', JSON.stringify(userWithType));
                } catch (error: any) {
                    console.warn('[Auth] getProfile failed', error?.response?.status, error?.response?.data);
                    // Silently handle 404 - endpoint not implemented yet
                    // Only log unexpected errors
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
            } else {
                console.log('[Auth] not authenticated (no access token)');
                setIsAuthenticated(false);
                setUser(null);
            }
            console.log('[Auth] checkAuth end', { isAuthenticated });
        };
        
        checkAuth();
    }, []);

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

            // Create user data from response - use the actual role from backend
            // Default to speaker role if not provided by backend
            const userData: User = {
                id: response.id,
                speaker_id: response.speaker_id,
                first_name: response.first_name,
                last_name: response.last_name,
                email: response.email,
                role: response.role || { id: 2, role: 'speaker' }, // Default to speaker if role not provided
                userType: response.role?.role || 'speaker' // Default to speaker
            };

            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));

            // Start automatic token refresh
            scheduleTokenRefresh();
            console.log('[Auth] scheduled token refresh');

            return getRoleBasedRedirectPath(userData);
        } finally {
            setLoading(false);
        }
    };

    // Helper function to determine where to redirect users based on role
    const getRoleBasedRedirectPath = (user: User) => {
        // Check for a saved redirect path first
        const savedRedirect = typeof window !== 'undefined' ? sessionStorage.getItem('redirectAfterLogin') : null;

        if (savedRedirect) {
            // Clear the stored redirect
            sessionStorage.removeItem('redirectAfterLogin');
            return savedRedirect;
        }

        // Default redirects based on role
        switch (user.role.role) {
            case 'speaker':
                return '/dashboard/speaker';
            case 'organizer':
                return '/dashboard/organizer';
            case 'attendee':
            default:
                return '/dashboard/attendee';
        }
    };

    const register = async (
        firstName: string,
        lastName: string,
        nationality: string,
        username: string,
        email: string,
        password: string
    ) => {
        setLoading(true);
        try {
            console.log("Attempting registration with:", { first_name: firstName, last_name: lastName, nationality, username, email });
            const response = await authApi.register({
                first_name: firstName,
                last_name: lastName,
                nationality,
                username,
                email,
                password
            });

            console.log("Registration response:", response);

            // Registration successful - account created
            // Don't set user or isAuthenticated here - user needs to login to get tokens
            // Just return success, the sign-up form will redirect to signin
            return true;
        } catch (error) {
            console.error("Registration error in context:", error);
            throw error;
        } finally {
            setLoading(false);
        }
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

    return (
        <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, isAuthenticated }}>
            {children}
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
