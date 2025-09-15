// Authentication API client for SpeakWise backend
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Token refresh parameters
const TOKEN_REFRESH_INTERVAL = 4 * 60 * 1000; // 4 minutes
let refreshTokenInterval: ReturnType<typeof setInterval> | null = null;

export interface User {
    id: number;
    email: string;
    name: string;
    roles: string[];
}

export interface RegisterUserData {
    email: string;
    password: string;
    userType: 'attendee' | 'speaker' | 'organizer';
    firstName: string;
    lastName: string;
    nationality: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface AuthResponse {
    refresh: string;
    access: string;
    user?: any; // Structure depends on the role
}

class AuthAPI {
    async register(userData: RegisterUserData): Promise<any> {
        try {
            // Log what we're sending to the backend
            const payload = {
                email: userData.email,
                password: userData.password,
                username: userData.email, // Use email as username
                first_name: userData.firstName,
                last_name: userData.lastName,
                nationality: userData.nationality,
                role: {
                    display: userData.userType // Map to user role
                }
            };
            console.log('Sending registration data:', payload);

            // Step 1: Register the user
            const registerResponse = await fetch(`${API_BASE_URL}/users/register/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            // Log the full response for debugging
            console.log('Registration response status:', registerResponse.status);
            const responseText = await registerResponse.text();
            console.log('Registration response text:', responseText);

            if (!registerResponse.ok) {
                let errorData;
                try {
                    errorData = JSON.parse(responseText);
                } catch (e) {
                    errorData = { detail: responseText || 'Registration failed' };
                }
                console.error('Registration error response:', errorData);
                throw new Error(errorData.detail || 'Registration failed');
            }

            // Parse the response text as JSON if it's valid
            let userResult;
            try {
                userResult = JSON.parse(responseText);
            } catch (e) {
                console.error('Failed to parse response as JSON', e);
                userResult = { message: 'User created but response could not be parsed' };
            }

            console.log('Registration successful:', userResult);

            // Step 2: Login with the newly created account based on role
            return await this.login({
                email: userData.email,
                password: userData.password
            }, userData.userType);
        } catch (error) {
            console.error('Error during registration:', error);
            throw error;
        }
    }

    async login(credentials: LoginData, userType: 'attendee' | 'speaker' | 'organizer' = 'attendee'): Promise<AuthResponse> {
        try {
            // Use the appropriate login endpoint based on user type
            const endpoint = `/auth/${userType}/`;

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: credentials.email,
                    password: credentials.password
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Login error response:', errorData);
                throw new Error(errorData.error || errorData.detail || 'Login failed');
            }

            const authData = await response.json();

            // Store tokens in localStorage for persistence
            this.setTokens(authData.access, authData.refresh);

            // Setup automatic token refresh
            this.setupTokenRefresh();

            return authData;
        } catch (error) {
            console.error('Error during login:', error);
            throw error;
        }
    }

    async logout(): Promise<void> {
        try {
            const refreshToken = localStorage.getItem('refresh_token');

            // Clear the token refresh interval
            this.clearTokenRefresh();

            if (refreshToken) {
                await fetch(`${API_BASE_URL}/users/logout/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ refresh_token: refreshToken })
                });
            }

            // Clear tokens from localStorage
            this.clearTokens();
        } catch (error) {
            console.error('Error during logout:', error);
            // Still clear tokens even if API call fails
            this.clearTokens();
            throw error;
        }
    }

    async refreshToken(): Promise<boolean> {
        try {
            const refreshToken = this.getRefreshToken();

            if (!refreshToken) {
                return false;
            }

            const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    refresh: refreshToken
                })
            });

            if (!response.ok) {
                // If refresh fails, log out the user
                this.clearTokens();
                this.clearTokenRefresh();
                return false;
            }

            const data = await response.json();

            // Update the access token
            localStorage.setItem('access_token', data.access);

            return true;
        } catch (error) {
            console.error('Error refreshing token:', error);
            return false;
        }
    }

    setupTokenRefresh(): void {
        // Clear any existing interval
        this.clearTokenRefresh();

        // Set up new interval for token refresh
        if (typeof window !== 'undefined') {
            refreshTokenInterval = setInterval(() => {
                this.refreshToken();
            }, TOKEN_REFRESH_INTERVAL);
        }
    }

    clearTokenRefresh(): void {
        if (refreshTokenInterval) {
            clearInterval(refreshTokenInterval);
            refreshTokenInterval = null;
        }
    }

    setTokens(accessToken: string, refreshToken: string): void {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
    }

    clearTokens(): void {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }

    getAccessToken(): string | null {
        return localStorage.getItem('access_token');
    }

    getRefreshToken(): string | null {
        return localStorage.getItem('refresh_token');
    }

    isAuthenticated(): boolean {
        return !!this.getAccessToken();
    }
}

// Create and export a singleton instance
export const authAPI = new AuthAPI();
