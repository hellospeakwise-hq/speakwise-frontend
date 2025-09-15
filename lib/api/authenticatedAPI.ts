import { authApiSimple } from './authApiSimple'

// API request interceptor to add authentication headers
export class AuthenticatedAPI {
  private baseURL: string

  constructor(baseURL?: string) {
    this.baseURL = baseURL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
  }

  private getAuthHeaders(): HeadersInit {
    const token = authApiSimple.getAccessToken()
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  private async handleResponse(response: Response) {
    if (response.status === 401) {
      // Token might be expired, try to refresh
      try {
        await authApiSimple.refreshToken()
        // Retry the request with new token
        return null // Signal to retry
      } catch (error) {
        // Refresh failed, logout user
        authApiSimple.logout()
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/signin'
        }
        throw new Error('Session expired. Please login again.')
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
    }

    return response
  }

  async get(endpoint: string, requireAuth: boolean = true): Promise<any> {
    const headers = requireAuth ? this.getAuthHeaders() : { 'Content-Type': 'application/json' }
    
    let response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers,
    })

    const handledResponse = await this.handleResponse(response)
    if (handledResponse === null && requireAuth) {
      // Retry with new token
      const newHeaders = this.getAuthHeaders()
      response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers: newHeaders,
      })
      await this.handleResponse(response)
    }

    return response.json()
  }

  async post(endpoint: string, data: any, requireAuth: boolean = true): Promise<any> {
    const headers = requireAuth ? this.getAuthHeaders() : { 'Content-Type': 'application/json' }
    
    let response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    })

    const handledResponse = await this.handleResponse(response)
    if (handledResponse === null && requireAuth) {
      // Retry with new token
      const newHeaders = this.getAuthHeaders()
      response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: newHeaders,
        body: JSON.stringify(data),
      })
      await this.handleResponse(response)
    }

    return response.json()
  }

  async patch(endpoint: string, data: any, requireAuth: boolean = true): Promise<any> {
    const headers = requireAuth ? this.getAuthHeaders() : { 'Content-Type': 'application/json' }
    
    let response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    })

    const handledResponse = await this.handleResponse(response)
    if (handledResponse === null && requireAuth) {
      // Retry with new token
      const newHeaders = this.getAuthHeaders()
      response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PATCH',
        headers: newHeaders,
        body: JSON.stringify(data),
      })
      await this.handleResponse(response)
    }

    return response.json()
  }

  async put(endpoint: string, data: any, requireAuth: boolean = true): Promise<any> {
    const headers = requireAuth ? this.getAuthHeaders() : { 'Content-Type': 'application/json' }
    
    let response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    })

    const handledResponse = await this.handleResponse(response)
    if (handledResponse === null && requireAuth) {
      // Retry with new token
      const newHeaders = this.getAuthHeaders()
      response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: newHeaders,
        body: JSON.stringify(data),
      })
      await this.handleResponse(response)
    }

    return response.json()
  }

  async delete(endpoint: string, requireAuth: boolean = true): Promise<any> {
    const headers = requireAuth ? this.getAuthHeaders() : { 'Content-Type': 'application/json' }
    
    let response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers,
    })

    const handledResponse = await this.handleResponse(response)
    if (handledResponse === null && requireAuth) {
      // Retry with new token
      const newHeaders = this.getAuthHeaders()
      response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: newHeaders,
      })
      await this.handleResponse(response)
    }

    if (response.status === 204) {
      return null // No content
    }

    return response.json()
  }

  // For file uploads
  async postFormData(endpoint: string, formData: FormData, requireAuth: boolean = true): Promise<any> {
    const token = authApiSimple.getAccessToken()
    const headers: HeadersInit = {}
    if (requireAuth && token) {
      headers.Authorization = `Bearer ${token}`
    }
    
    let response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    })

    const handledResponse = await this.handleResponse(response)
    if (handledResponse === null && requireAuth) {
      // Retry with new token
      const newToken = authApiSimple.getAccessToken()
      const newHeaders: HeadersInit = {}
      if (newToken) {
        newHeaders.Authorization = `Bearer ${newToken}`
      }
      response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: newHeaders,
        body: formData,
      })
      await this.handleResponse(response)
    }

    return response.json()
  }
}

// Create a singleton instance
export const authenticatedAPI = new AuthenticatedAPI()
