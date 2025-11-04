import React, { createContext, useContext, useEffect, useState } from 'react'
import { setAccessToken, clearAccessToken, restoreAccessToken } from '../api/client'

const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // On mount, restore user from localStorage (NO auto refresh)
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedUser = localStorage.getItem('user')
        const refreshToken = localStorage.getItem('refreshToken')

        // Attempt to restore access token into memory
        restoreAccessToken()

        if (storedUser && refreshToken) {
          setUser(JSON.parse(storedUser))
        } else {
          // Incomplete auth data, ensure everything cleared
          clearAccessToken()
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
        }
      } catch (error) {
        console.error('Error restoring auth:', error)
        clearAccessToken()
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  // Listen for storage changes (logout from another tab)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'refreshToken' && !e.newValue) {
        // Refresh token removed, logout
        setUser(null)
        clearAccessToken()
      } else if (e.key === 'user' && e.newValue) {
        // User updated in another tab
        setUser(JSON.parse(e.newValue))
      }
    }

    // Listen for auth:logout event from interceptor
    const handleAuthLogout = () => {
      setUser(null)
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('auth:logout', handleAuthLogout)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('auth:logout', handleAuthLogout)
    }
  }, [])

  const login = (accessTokenValue, refreshTokenValue, userData) => {
    // Store access token in memory
    setAccessToken(accessTokenValue)
    
    // Store refresh token in localStorage (persistent)
    localStorage.setItem('refreshToken', refreshTokenValue)
    
    // Store user data
    const userInfo = {
      id: userData.id,
      email: userData.email,
      fullName: userData.fullName,
      nights: userData.nights || 0,
    }
    setUser(userInfo)
    localStorage.setItem('user', JSON.stringify(userInfo))
  }

  const logout = () => {
    // Clear tokens
    clearAccessToken()
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    
    // Clear user state
    setUser(null)
  }

  const updateUser = (updates) => {
    if (user) {
      const updated = { ...user, ...updates }
      setUser(updated)
      localStorage.setItem('user', JSON.stringify(updated))
    }
  }

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

