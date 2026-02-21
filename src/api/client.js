/* ─────────────────────────────────────────────
   PharmaLite – centralised API client
   All requests automatically attach the JWT.
───────────────────────────────────────────── */

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export class ApiError extends Error {
    constructor(message, status) {
        super(message)
        this.status = status
    }
}

export async function api(path, options = {}) {
    const token = localStorage.getItem('pharmalite_token')

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
    }

    const res = await fetch(`${BASE}${path}`, { ...options, headers })

    // 204 No Content — nothing to parse
    if (res.status === 204) return null

    const data = await res.json().catch(() => ({ message: 'Unexpected server response' }))

    if (!res.ok) {
        // Auto-clear stale / invalid token and redirect to login
        if (res.status === 401) {
            localStorage.removeItem('pharmalite_token')
            localStorage.removeItem('pharmalite_user')
            // Only redirect if not already on an auth page
            if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
                window.location.href = '/login'
            }
        }
        throw new ApiError(data.message || 'Request failed', res.status)
    }
    return data
}

/* Convenience wrappers */
export const get = (path, opts) => api(path, { method: 'GET', ...opts })
export const post = (path, body) => api(path, { method: 'POST', body: JSON.stringify(body) })
export const put = (path, body) => api(path, { method: 'PUT', body: JSON.stringify(body) })
export const del = (path) => api(path, { method: 'DELETE' })

