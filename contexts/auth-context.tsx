"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApiSimple } from '@/lib/api/authApiSimple';
import { useRouter } from 'next/navigation';

type User = {
    id: number;
    firstName?: string;
    lastName?: string;
    email: string;
    userType?: 'attendee' | 'speaker' | 'organizer' | 'admin';
};

interface AuthContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    loading: boolean;
    login: (email: string, password: string, userType: 'attendee' | 'speaker' | 'organizer' | 'admin') => Promise<string>;
    register: (firstName: string, lastName: string, nationality: string, email: string, password: string, userType: 'attendee' | 'speaker' | 'organizer' | 'admin') => Promise<string>;
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
            if (authApiSimple.isAuthenticated()) {
                try {
                    setIsAuthenticated(true);
                    // Try to load user from localStorage
                    const storedUser = localStorage.getItem('user');
                    if (storedUser) {
                        setUser(JSON.parse(storedUser));
                    } else {
                        setUser({
                            id: 1,
                            firstName: 'User',
                            lastName: '',
                            email: 'user@example.com',
                            userType: 'attendee',
                        });
                    }
                } catch (error) {
                    console.error('Error validating authentication', error);
                    authApiSimple.logout();
                    setIsAuthenticated(false);
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
            const response = await authApiSimple.login({ email, password }, userType);
            setIsAuthenticated(true);
            const userData = {
                id: response.user?.id || 1,
                firstName: response.user?.first_name || '',
                lastName: response.user?.last_name || '',
                email: response.user?.email || email,
                userType: response.user?.role?.display || userType,
            };
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return "/";
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
        switch (user.userType) {
            case 'speaker':
                return '/dashboard/speaker';
            case 'organizer':
                return '/dashboard'; // Could be a specific organizer dashboard in the future
            case 'attendee':
            default:
                return '/dashboard';
        }
    };

    const register = async (
        firstName: string,
        lastName: string,
        nationality: string,
        email: string,
        password: string,
        userType: 'attendee' | 'speaker' | 'organizer'
    ) => {
        setLoading(true);
        try {
            console.log("Attempting registration with:", { firstName, lastName, nationality, email, userType });
            const response = await authApiSimple.register({
                firstName,
                lastName,
                nationality,
                email,
                password,
                userType
            });

            console.log("Registration response:", response);
            setIsAuthenticated(true);

            // If registration is successful, we assume it returns a login response with tokens
            // Log the user in using these credentials
            const loginResponse = await authApiSimple.login({ email, password }, userType);

            const userData = {
                id: response.id || 1,
                firstName,
                lastName,
                email,
                userType,
            };
            setUser(userData);

            // Return the redirect path for after registration
            return getRoleBasedRedirectPath(userData);
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
            await authApiSimple.logout();
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem('user');
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
