import React, { createContext, useContext, useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'

const STORAGE_KEY = 'ia03_user'
const TOKEN_KEY = 'ia03_token'

const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const token = localStorage.getItem(TOKEN_KEY)
      if (token) {
        const decoded = jwtDecode(token)
        const raw = localStorage.getItem(STORAGE_KEY)
        return raw ? JSON.parse(raw) : { email: decoded.email, nights: 0 }
      }
      return null
    } catch (e) {
      return null
    }
  })

  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    else localStorage.removeItem(STORAGE_KEY)
  }, [user])

  useEffect(() => {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  }, [token])

  const login = (email, jwtToken) => {
    setToken(jwtToken)
    setUser({ email, nights: 0 })
  }

  const logout = () => {
    setUser(null)
    setToken(null)
  }

  const incrementNights = () => {
    setUser((u) => (u ? { ...u, nights: (u.nights || 0) + 1 } : u))
  }

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    login,
    logout,
    incrementNights,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
