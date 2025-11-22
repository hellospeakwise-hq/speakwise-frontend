"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, type AuthResponse } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';
import { scheduleTokenRefresh, cancelTokenRefresh, initializeTokenRefresh } from '@/lib/utils/tokenRefresh';

type User = {
    id: string;
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
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isClient, setIsClient] = useState<boolean>(false);
    const router = useRouter();

    // Mark component as client-side after hydration
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Check if user is already logged in on initial load
    useEffect(() => {
        if (!isClient) return; // Don't run on server

        const checkAuth = async () => {
            setLoading(true);
            if (authApi.isAuthenticated()) {
                // Initialize automatic token refresh for existing session
                initializeTokenRefresh();

                // Always use stored user data first
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    try {
                        setUser(JSON.parse(storedUser));
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
                    // Silently handle 404 - endpoint not implemented yet
                    // Only log unexpected errors
                    if (error?.response?.status !== 404) {
                        console.error('Error validating authentication', error);
                    }
                    // If no stored user exists, logout
                    if (!storedUser) {
                        await authApi.logout();
                        setIsAuthenticated(false);
                    }
                    // Otherwise, continue with stored user data (404 is expected during development)
                }
            } else {
                setIsAuthenticated(false);
            }
            setLoading(false);
        };
        checkAuth();
    }, [isClient]);

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
                }
            }

            if (response.refresh_token || response.refresh) {
                const refreshToken = response.refresh_token || response.refresh;
                if (refreshToken && typeof window !== 'undefined') {
                    localStorage.setItem('refreshToken', refreshToken);
                }
            }

            // Create user data from response - use the actual role from backend
            // Default to speaker role if not provided by backend
            const userData: User = {
                id: response.id,
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

            // Use the response data directly as it matches our User type
            // All new users default to speaker role
            const userData: User = {
                id: response.id,
                first_name: response.first_name,
                last_name: response.last_name,
                email: response.email,
                role: response.role || { id: 2, role: 'speaker' }, // Default to speaker if role not provided
                userType: response.role?.role || 'speaker' // Default to speaker
            };

            setUser(userData);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(userData));

            // Start automatic token refresh
            scheduleTokenRefresh();

            // Return dashboard path - all new users default to speaker
            return "/dashboard/speaker";
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
