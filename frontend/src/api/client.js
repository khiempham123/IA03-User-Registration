import axios from 'axios'
import { jwtDecode } from 'jwt-decode'

const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3333'
const ACCESS_TOKEN_STORAGE_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'
const TOKEN_REFRESH_THRESHOLD_MS = 60 * 1000 // Refresh when less than 1 minute left

// Create axios instance
export const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
})

// Runtime state
let accessToken = null
let isRefreshing = false
let refreshQueue = []

// ============================================
// TOKEN VALIDATION HELPERS
// ============================================

/**
 * Check if token is actually expired (past exp time)
 */
const isTokenExpired = (token) => {
  if (!token) return true
  try {
    const decoded = jwtDecode(token)
    if (!decoded?.exp) return true
    
    // Get current timestamp
    const now = new Date().getTime()
    const expireTime = decoded.exp * 1000
    
    // Token is expired if current time >= expiration time
    return now >= expireTime
  } catch (error) {
    console.warn('Token decode failed:', error)
    return true
  }
}

/**
 * Check if token should be refreshed proactively
 * (when it's about to expire soon but not yet expired)
 */
const shouldRefreshToken = (token) => {
  if (!token) return false
  try {
    const decoded = jwtDecode(token)
    if (!decoded?.exp) return false
    
    const now = new Date().getTime()
    const expiresAt = decoded.exp * 1000
    const timeLeft = expiresAt - now
    
    // Refresh if less than threshold time left AND not yet expired
    return timeLeft > 0 && timeLeft <= TOKEN_REFRESH_THRESHOLD_MS
  } catch (error) {
    return false
  }
}

/**
 * Get time until token expires (in milliseconds)
 */
const getTokenTimeToExpire = (token) => {
  if (!token) return 0
  try {
    const decoded = jwtDecode(token)
    if (!decoded?.exp) return 0
    
    const now = new Date().getTime()
    const expiresAt = decoded.exp * 1000
    const timeLeft = expiresAt - now
    
    return Math.max(0, timeLeft)
  } catch {
    return 0
  }
}

// ============================================
// QUEUE MANAGEMENT
// ============================================

const processQueue = (error, token = null) => {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })
  refreshQueue = []
}

const addToQueue = () =>
  new Promise((resolve, reject) => {
    refreshQueue.push({ resolve, reject })
  })

// ============================================
// SESSION MANAGEMENT
// ============================================

export const clearAccessToken = () => {
  accessToken = null
  sessionStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
}

const clearSession = () => {
  clearAccessToken()
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem('user')
}

export const setAccessToken = (token) => {
  if (!token) {
    clearAccessToken()
    return
  }

  // Don't save expired tokens
  if (isTokenExpired(token)) {
    console.warn('⚠️ Attempted to set an expired token')
    clearAccessToken()
    return
  }

  accessToken = token
  sessionStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token)
  
  const ttl = Math.floor(getTokenTimeToExpire(token) / 1000)
  console.log(`✅ Access token set, expires in ${ttl} seconds`)
}

export const getAccessToken = () => accessToken

// ============================================
// TOKEN REFRESH
// ============================================

const performTokenRefresh = async (refreshToken) => {
  console.log('🔄 Refreshing access token...')

  try {
    const response = await axios.post(`${BASE}/auth/refresh`, { refreshToken })
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data

    if (!newAccessToken || !newRefreshToken) {
      throw new Error('Invalid refresh response')
    }

    // Update tokens
    setAccessToken(newAccessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken)

    console.log('✅ Token refresh successful')
    return newAccessToken
  } catch (error) {
    console.error('❌ Token refresh failed:', error.response?.data || error.message)
    throw error
  }
}

/**
 * Ensure we have a valid access token
 * - Returns current token if still valid
 * - Refreshes token if expired or expiring soon
 * - Returns null if no refresh token available
 */
const ensureValidAccessToken = async () => {
  // Check if current token is still good
  if (accessToken) {
    const expired = isTokenExpired(accessToken)
    const shouldRefresh = shouldRefreshToken(accessToken)
    const ttl = Math.floor(getTokenTimeToExpire(accessToken) / 1000)
    
    console.log('🔍 Token validation:', {
      hasToken: true,
      expired,
      shouldRefresh,
      ttlSeconds: ttl
    })
    
    if (!expired && !shouldRefresh) {
      // Token is still valid and not expiring soon
      console.log('✅ Using existing valid token')
      return accessToken
    }
    
    console.log('⚠️ Token needs refresh:', { expired, shouldRefresh })
  } else {
    console.log('⚠️ No access token in memory')
  }

  // Get refresh token
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
  if (!refreshToken) {
    console.log('⚠️ No refresh token available')
    return null
  }

  // Check if refresh token is expired
  if (isTokenExpired(refreshToken)) {
    console.log('❌ Refresh token expired')
    clearSession()
    return null
  }

  // If already refreshing, join the queue
  if (isRefreshing) {
    console.log('⏳ Token refresh in progress, joining queue...')
    try {
      return await addToQueue()
    } catch (error) {
      return null
    }
  }

  // Start refresh process
  isRefreshing = true

  try {
    const newToken = await performTokenRefresh(refreshToken)
    processQueue(null, newToken)
    return newToken
  } catch (error) {
    processQueue(error, null)
    clearSession()
    return null
  } finally {
    isRefreshing = false
  }
}

// ============================================
// STORAGE INITIALIZATION
// ============================================

const loadAccessTokenFromStorage = () => {
  const storedToken = sessionStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
  if (!storedToken) return null

  // Validate stored token
  if (isTokenExpired(storedToken)) {
    console.log('⚠️ Stored access token is expired, removing...')
    sessionStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
    return null
  }

  accessToken = storedToken
  const ttl = Math.floor(getTokenTimeToExpire(storedToken) / 1000)
  console.log(`✅ Restored access token from storage (expires in ${ttl}s)`)
  return storedToken
}

export const restoreAccessToken = () => loadAccessTokenFromStorage()

// Initialize on module load
loadAccessTokenFromStorage()

// ============================================
// AXIOS INTERCEPTORS
// ============================================

/**
 * Request interceptor - attach valid token to requests
 */
api.interceptors.request.use(
  async (config) => {
    const url = config.url || ''

    // Skip auth for public endpoints
    if (
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/refresh')
    ) {
      return config
    }

    try {
      const token = await ensureValidAccessToken()
      if (token) {
        console.log('📤 Attaching token to request:', {
          url: url,
          method: config.method,
          tokenPreview: token.substring(0, 30) + '...' + token.substring(token.length - 10),
          authHeader: `Bearer ${token.substring(0, 20)}...`
        })
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${token}`
      } else {
        console.log('⚠️ No valid token for request:', url)
      }
    } catch (error) {
      console.error('❌ Error in request interceptor:', error)
      // Don't block the request, let it fail with 401 if needed
    }

    return config
  },
  (error) => {
    console.error('❌ Request interceptor error:', error)
    return Promise.reject(error)
  }
)

/**
 * Response interceptor - handle 401 errors and retry with refreshed token
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status
    const url = originalRequest?.url || ''

    // Only handle 401 errors
    if (status !== 401) {
      return Promise.reject(error)
    }

    // Don't retry auth endpoints
    if (
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/refresh')
    ) {
      return Promise.reject(error)
    }

    // Don't retry if we already tried once
    if (originalRequest._retry) {
      console.log('❌ Retry failed, clearing session...')
      clearSession()
      window.dispatchEvent(new Event('auth:logout'))
      return Promise.reject(error)
    }

    // Mark as retried
    originalRequest._retry = true

    try {
      // Try to get a fresh token
      const newToken = await ensureValidAccessToken()
      
      if (!newToken) {
        throw new Error('No valid token after refresh')
      }

      // Retry the original request with new token
      originalRequest.headers.Authorization = `Bearer ${newToken}`
      console.log('🔄 Retrying request with refreshed token...')
      return api(originalRequest)
    } catch (refreshError) {
      console.log('❌ Token refresh failed, clearing session...')
      clearSession()
      window.dispatchEvent(new Event('auth:logout'))
      return Promise.reject(error)
    }
  }
)