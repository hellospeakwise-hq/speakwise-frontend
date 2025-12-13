// Simple Authentication API client for SpeakWise backend
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Types
export type UserRole = 'attendee' | 'speaker' | 'organizer' | 'admin';

export interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    nationality: string;
    userType: UserRole;
}

export interface LoginData {
    email: string;
    password: string;
}

// Simple API service
export const authApiSimple = {
    // Register a new user
    async register(data: RegisterData) {
        // Create username from email (before @ symbol)
        const username = data.email.split('@')[0];

        const payload = {
            email: data.email,
            password: data.password,
            username: username,
            first_name: data.firstName,
            last_name: data.lastName,
            nationality: data.nationality,
            role: data.userType
        };

        console.log('Registration payload:', payload);

        const response = await fetch(`${API_BASE_URL}/users/auth/register/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        console.log('Registration response status:', response.status);

        if (!response.ok) {
            let errorMessage = 'Registration failed';

            try {
                // Read response as text first, then try to parse as JSON
                const responseText = await response.text();
                console.error('Registration error text:', responseText);

                try {
                    const errorData = JSON.parse(responseText);
                    console.error('Registration error details:', errorData);
                    errorMessage = JSON.stringify(errorData);
                } catch (parseError) {
                    // If it's not valid JSON, use the text as is
                    errorMessage = responseText || errorMessage;
                }
            } catch (e) {
                console.error('Error reading response:', e);
                errorMessage = 'Failed to read error response';
            }

            throw new Error(errorMessage);
        }

        return await response.json();
    },

    // Login a user
    async login(data: LoginData, userType: UserRole) {
        const endpoint = `/auth/${userType}/`;
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: data.email,
                password: data.password
            })
        });
        if (!response.ok) {
            let errorMessage = 'Invalid credentials';
            try {
                // Only read the body once
                const errorData = await response.clone().json().catch(() => null);
                if (errorData && (errorData.error || errorData.detail)) {
                    errorMessage = errorData.error || errorData.detail;
                }
            } catch (e) {
                // fallback
            }
            throw new Error(errorMessage);
        }
        const authData = await response.json();
        // Store tokens
        localStorage.setItem('access_token', authData.access);
        localStorage.setItem('refresh_token', authData.refresh);
        return authData;
    },

    // Logout the current user
    async logout() {
        const refreshToken = localStorage.getItem('refresh_token');

        if (refreshToken) {
            try {
                await fetch(`${API_BASE_URL}/users/logout/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ refresh_token: refreshToken })
                });
            } catch (e) {
                console.error('Error during logout:', e);
            }
        }

        // Always clear tokens
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    },

    // Check if user is authenticated
    isAuthenticated() {
        return !!localStorage.getItem('access_token');
    },

    // Get access token
    getAccessToken() {
        return localStorage.getItem('access_token');
    },

    // Get refresh token
    getRefreshToken() {
        return localStorage.getItem('refresh_token');
    },

    // Refresh access token
    async refreshToken() {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const response = await fetch(`${API_BASE_URL}/users/token/refresh/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refresh: refreshToken })
        });

        if (!response.ok) {
            throw new Error('Failed to refresh token');
        }

        const data = await response.json();
        localStorage.setItem('access_token', data.access);
        return data.access;
    },

    // Request password reset
    async requestPasswordReset(email: string) {
        const response = await fetch(`${API_BASE_URL}/users/auth/password-reset/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || 'Failed to request password reset');
        }

        return await response.json();
    },

    // Confirm password reset with token
    async confirmPasswordReset(email: string, token: string, newPassword: string) {
        const response = await fetch(`${API_BASE_URL}/users/auth/password-reset/confirm`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                token,
                new_password: newPassword
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || 'Failed to reset password');
        }

        return await response.json();
    }
}