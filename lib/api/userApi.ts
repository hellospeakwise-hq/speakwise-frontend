// Add to existing authApiSimple or create a new user API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export interface UpdateUserData {
    first_name?: string;
    last_name?: string;
    email?: string;
    nationality?: string;
}

export const userApi = {
    // Update basic user information
    async updateUser(data: UpdateUserData) {
        const token = localStorage.getItem('access_token');
        if (!token) {
            throw new Error('No access token found');
        }

        const response = await fetch(`${API_BASE_URL}/api/users/profile/`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Failed to update user information');
        }

        return await response.json();
    }
};