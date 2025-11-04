# Authentication Flow Documentation

## Overview
This application implements a secure JWT-based authentication system with access tokens and refresh tokens, following industry best practices.

## Architecture

### Token Management Strategy

#### 1. Access Token
- **Storage**: Memory (React state variable in `client.js`)
- **Lifetime**: 5 hours (for testing - should be 15 minutes in production)
- **Purpose**: Authorize API requests
- **Security**: Never persisted to disk, cleared on page refresh

#### 2. Refresh Token
- **Storage**: localStorage (persistent)
- **Lifetime**: 7 days
- **Purpose**: Obtain new access tokens when expired
- **Security**: Hashed in database, rotated on each refresh

### Authentication Flow

#### 1. Login Flow
```
User submits credentials
    ↓
POST /auth/login
    ↓
Server validates & returns { accessToken, refreshToken, user }
    ↓
Frontend stores:
  - accessToken → memory (via setAccessToken())
  - refreshToken → localStorage
  - user data → localStorage
    ↓
User state updated in AuthContext
    ↓
Redirect to protected route
```

#### 2. Protected Route Access
```
User navigates to /profile
    ↓
ProtectedRoute checks isAuthenticated
    ↓
IF user exists in AuthContext:
  - Allow access
  - Profile component fetches data via React Query
ELSE:
  - Redirect to /login
```

#### 3. API Request Flow (with Auto-Refresh)
```
React Query calls api.get('/user/profile')
    ↓
Axios Request Interceptor attaches: Authorization: Bearer {accessToken}
    ↓
Server processes request
    ↓
IF access token valid:
  - Return data
  - Request completes successfully
    
IF access token expired (401 Unauthorized):
  - Axios Response Interceptor catches 401
  - Get refreshToken from localStorage
  - Call POST /auth/refresh with refreshToken
  - IF refresh succeeds:
    * Store new accessToken in memory
    * Store new refreshToken in localStorage
    * Retry original request with new token
    * Return data to React Query
  - IF refresh fails:
    * Clear all tokens
    * Dispatch 'auth:logout' event
    * AuthContext clears user state
    * ProtectedRoute redirects to /login
```

#### 4. Logout Flow
```
User clicks Logout
    ↓
Call logout() from AuthContext
    ↓
POST /auth/logout (clears refresh token in DB)
    ↓
Clear tokens:
  - clearAccessToken() → memory
  - localStorage.removeItem('refreshToken')
  - localStorage.removeItem('user')
    ↓
Update user state to null
    ↓
Redirect to /login
```

#### 5. Page Refresh (Session Restoration)
```
User refreshes page
    ↓
AuthContext initializes
    ↓
Check localStorage for 'user' and 'refreshToken'
    ↓
IF both exist:
  - Set user state from localStorage
  - Set isAuthenticated = true
  - NO preemptive token refresh
  - Access token will be refreshed on first 401
ELSE:
  - User stays logged out
```

## Key Components

### 1. AuthContext (`frontend/src/context/AuthContext.jsx`)
- Manages global authentication state
- Provides: `user`, `isAuthenticated`, `isLoading`, `login()`, `logout()`, `updateUser()`
- Listens for storage changes (multi-tab logout sync)
- Listens for 'auth:logout' event from interceptor

### 2. Axios Client (`frontend/src/api/client.js`)
- Singleton axios instance with interceptors
- **Request Interceptor**: Attaches access token from memory
- **Response Interceptor**: 
  - Catches 401 errors
  - Implements request queuing to avoid duplicate refresh calls
  - Auto-refreshes tokens using vanilla axios (no interceptor loop)
  - Dispatches logout event on refresh failure

### 3. Protected Route (`frontend/src/components/ProtectedRoute.jsx`)
- Guards routes requiring authentication
- Shows loading spinner while auth initializes
- Redirects to /login if not authenticated

### 4. Backend Auth Service (`backend/src/auth/auth.service.ts`)
- **register()**: Hash password, create user
- **login()**: Validate credentials, generate token pair
- **refreshTokens()**: Validate refresh token, issue new pair (token rotation)
- **logout()**: Clear refresh token from database

## Security Features

### 1. Token Rotation
- Each refresh generates a new token pair
- Old refresh token is invalidated
- Prevents token replay attacks

### 2. Memory-Only Access Tokens
- Access tokens never touch localStorage
- XSS attacks cannot steal access tokens
- Cleared on page refresh for additional security

### 3. Refresh Token Validation
- Stored as bcrypt hash in database
- Expiry time checked server-side
- Invalid/expired tokens force re-authentication

### 4. Request Queuing
- Multiple simultaneous 401s trigger only ONE refresh call
- Other requests wait in queue
- All retry with new token after refresh completes

### 5. Multi-Tab Sync
- localStorage events propagate logout across tabs
- Prevents inconsistent auth state

## Error Handling

### 1. Network Errors
```javascript
try {
  await api.post('/auth/login', data)
} catch (err) {
  if (err.response) {
    // Server responded with error
    if (err.response.status === 401) {
      message = 'Email hoặc mật khẩu không đúng'
    } else if (err.response.status >= 500) {
      message = 'Lỗi server. Vui lòng thử lại sau'
    }
  } else if (err.request) {
    // No response from server
    message = 'Không thể kết nối đến server'
  }
}
```

### 2. Token Expiration
- **Access token expired**: Auto-refresh via interceptor
- **Refresh token expired**: Auto-logout, redirect to login
- User sees toast: "Phiên đăng nhập đã hết hạn"

### 3. Backend Error Messages
- All exceptions filtered through `AllExceptionsFilter`
- User-friendly Vietnamese messages
- Detailed logging in development only

## React Query Integration

### Profile Page
```javascript
const { data: profile, isLoading, error, refetch } = useQuery({
  queryKey: ["profile"],
  queryFn: async () => {
    const res = await api.get("/user/profile")
    return res.data.user || res.data
  },
  enabled: isAuthenticated,
  retry: false, // Don't retry - let interceptor handle 401
  refetchOnWindowFocus: false,
  staleTime: 5 * 60 * 1000, // Cache for 5 minutes
})
```

### Mutations
- **Login/Logout**: `useMutation` for auth actions
- **Profile Update**: Optimistic updates with cache invalidation
- **Increment Nights**: Direct API call with manual cache update

## Testing Scenarios

### 1. Happy Path
1. Register new account
2. Auto-login after registration
3. Navigate to profile → Data loads
4. Edit profile → Update succeeds
5. Increment nights → Counter updates
6. Refresh page → Session restored
7. Logout → Redirect to login

### 2. Error Scenarios
1. Login with wrong password → Error toast
2. Register with duplicate email → "Email đã được sử dụng"
3. Access profile without login → Redirect to login
4. Network error during login → "Không thể kết nối đến server"
5. Token expires during session → Auto-refresh, continue working
6. Refresh token expires → Auto-logout, redirect to login

### 3. Edge Cases
1. Logout in one tab → Other tabs logout automatically
2. Multiple API calls with expired token → Only one refresh call
3. Refresh fails while multiple requests pending → All requests fail gracefully

## Deployment Considerations

### Production Settings
- Change access token expiry to 15 minutes
- Use HTTPS only
- Set secure environment variables
- Enable CORS for frontend domain only
- Use secure, random JWT_SECRET

### Environment Variables
```
# Backend
JWT_SECRET=your-super-secret-key
MONGODB_URI=mongodb+srv://...
PORT=3333

# Frontend
VITE_API_BASE=https://your-backend-url.com
```

## API Endpoints

### Authentication
- `POST /auth/register` - Create new user account
- `POST /auth/login` - Login and get tokens
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout and clear refresh token

### User
- `GET /user/profile` - Get current user profile (protected)
- `PUT /user/profile` - Update user profile (protected)

## Dependencies

### Frontend
- `axios` - HTTP client with interceptors
- `@tanstack/react-query` - Data fetching and caching
- `react-hook-form` - Form validation
- `react-router-dom` - Client-side routing
- `jwt-decode` - JWT token decoding

### Backend
- `@nestjs/jwt` - JWT token generation
- `@nestjs/passport` - Authentication middleware
- `passport-jwt` - JWT strategy
- `bcrypt` - Password and token hashing
- `mongoose` - MongoDB ODM

## Compliance with Requirements

✅ **Authentication Flow**: Login/logout with access + refresh tokens
✅ **Token Management**: Access in memory, refresh in localStorage
✅ **Axios Configuration**: Interceptors for auth header and 401 handling
✅ **React Query Integration**: All data fetching uses React Query
✅ **React Hook Form**: Login/signup forms with validation
✅ **Protected Routes**: ProtectedRoute component guards routes
✅ **User Interface**: Complete login, profile, logout UI
✅ **Error Handling**: Comprehensive error messages and recovery
✅ **Public Hosting**: Ready for deployment (Vercel/Railway)

## Performance Optimizations

1. **Token in memory** - No localStorage read on every request
2. **Request queuing** - Prevents multiple simultaneous refresh calls
3. **Query caching** - React Query caches data for 5 minutes
4. **No preemptive refresh** - Only refresh when actually needed (on 401)
5. **Optimistic updates** - UI updates immediately, syncs in background
