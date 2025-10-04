"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, type AuthResponse } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';

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
    login: (email: string, password: string, userType: 'attendee' | 'speaker' | 'organizer') => Promise<string>;
    register: (firstName: string, lastName: string, nationality: string, username: string, email: string, password: string, userType: 'attendee' | 'speaker' | 'organizer') => Promise<string>;
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
                try {
                    // Try to get fresh user profile from API
                    const userProfile = await authApi.getProfile();
                    const userWithType = { ...userProfile, userType: userProfile.role.role };
                    setUser(userWithType);
                    setIsAuthenticated(true);
                    localStorage.setItem('user', JSON.stringify(userProfile));
                } catch (error) {
                    console.error('Error validating authentication', error);
                    // Fall back to stored user data
                    const storedUser = localStorage.getItem('user');
                    if (storedUser) {
                        try {
                            setUser(JSON.parse(storedUser));
                            setIsAuthenticated(true);
                        } catch (parseError) {
                            console.error('Error parsing stored user data', parseError);
                            await authApi.logout();
                            setIsAuthenticated(false);
                        }
                    } else {
                        await authApi.logout();
                        setIsAuthenticated(false);
                    }
                }
            } else {
                setIsAuthenticated(false);
            }
            setLoading(false);
        };
        checkAuth();
    }, [isClient]);

    const login = async (email: string, password: string, userType: 'attendee' | 'speaker' | 'organizer') => {
        setLoading(true);
        try {
            const response = await authApi.login({ email, password }, userType);
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
            
            // Create user data from response - use the actual role from backend, not the userType parameter
            const userData: User = {
                id: response.id,
                first_name: response.first_name,
                last_name: response.last_name,
                email: response.email,
                role: response.role, // Use actual role from backend
                userType: response.role.role // Set userType to the actual role from backend
            };
            
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
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
        password: string,
        userType: 'attendee' | 'speaker' | 'organizer'
    ) => {
        setLoading(true);
        try {
            console.log("Attempting registration with:", { firstName, lastName, nationality, username, email, userType });
            const response = await authApi.register({
                firstName,
                lastName,
                nationality,
                username,
                email,
                password,
                userType
            });

            console.log("Registration response:", response);
            
            // Use the response data directly as it matches our User type
            const userData: User = {
                id: response.id,
                first_name: response.first_name,
                last_name: response.last_name,
                email: response.email,
                role: response.role,
                userType: response.role.role
            };

            setUser(userData);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(userData));

            // Return success message - user will be redirected to signin
            return "/signin";
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
