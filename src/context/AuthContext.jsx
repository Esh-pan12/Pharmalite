import { createContext, useContext, useState } from 'react'
import { post, get } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('pharmalite_user')
        return saved ? JSON.parse(saved) : null
    })

    /* ── Login ── */
    const login = async (email, password) => {
        const data = await post('/api/auth/login', { email, password })
        localStorage.setItem('pharmalite_token', data.token)
        localStorage.setItem('pharmalite_user', JSON.stringify(data.user))
        setUser(data.user)
        return data.user
    }

    /* ── Register ── */
    const register = async ({ name, email, password, pharmacyName, licenseNo }) => {
        const data = await post('/api/auth/register', { name, email, password, pharmacyName, licenseNo })
        localStorage.setItem('pharmalite_token', data.token)
        localStorage.setItem('pharmalite_user', JSON.stringify(data.user))
        setUser(data.user)
        return data.user
    }

    /* ── Logout ── */
    const logout = () => {
        setUser(null)
        localStorage.removeItem('pharmalite_token')
        localStorage.removeItem('pharmalite_user')
        // clear legacy keys too
        localStorage.removeItem('pharmalite_accounts')
    }

    /* ── Refresh user from API ── */
    const refreshUser = async () => {
        try {
            const data = await get('/api/auth/me')
            setUser(data.user)
            localStorage.setItem('pharmalite_user', JSON.stringify(data.user))
        } catch {
            logout()
        }
    }

    return (
        <AuthContext.Provider value={{ user, login, register, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
    return ctx
}
