/**
 * api.ts — Test helper utilities for direct API calls
 *
 * Used in global setup / teardown to create/clean test data
 * without going through the browser.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000'

/** Register a new user. Returns the response body. */
export async function registerUser(payload: {
  first_name: string
  last_name: string
  username: string
  email: string
  password: string
  nationality?: string
}) {
  const res = await fetch(`${API_BASE}/api/users/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nationality: 'GH', ...payload }),
  })
  if (!res.ok) throw new Error(`registerUser failed: ${await res.text()}`)
  return res.json()
}

/** Log in and return { accessToken, refreshToken }. */
export async function loginUser(email: string, password: string) {
  const res = await fetch(`${API_BASE}/api/users/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error(`loginUser failed: ${await res.text()}`)
  const data = await res.json()
  return {
    accessToken: data.access_token ?? data.access,
    refreshToken: data.refresh_token ?? data.refresh,
  }
}
