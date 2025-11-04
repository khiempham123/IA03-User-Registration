# IA03 - JWT Authentication with Access & Refresh Tokens

## 📋 Tổng quan

Dự án React authentication sử dụng JWT với Access Token và Refresh Token, triển khai đầy đủ các tính năng bảo mật theo best practices.

## 🎯 Tính năng chính

### ✅ Authentication Flow
- **User Registration**: Đăng ký với validation đầy đủ (email, password strength, fullname)
- **User Login**: Đăng nhập với JWT access + refresh tokens
- **Auto Token Refresh**: Tự động làm mới access token khi hết hạn
- **Secure Logout**: Xóa tokens khỏi server và client

### ✅ Token Management
- **Access Token**: Lưu trong memory (15 phút expiry)
- **Refresh Token**: Lưu trong localStorage (7 ngày expiry)
- **Token Rotation**: Mỗi lần refresh tạo cặp token mới
- **Secure Storage**: Access token không lưu localStorage để tránh XSS

### ✅ Axios Interceptor
- **Request Interceptor**: Tự động attach access token vào mọi request
- **Response Interceptor**: Tự động refresh token khi nhận 401 Unauthorized
- **Error Handling**: Redirect về login khi refresh token hết hạn

### ✅ Protected Routes
- **Route Guards**: Kiểm tra authentication trước khi access
- **Auto Redirect**: Chuyển về login nếu chưa đăng nhập
- **Loading State**: Hiển thị loading khi kiểm tra auth state

### ✅ User Experience
- **Toast Notifications**: Thông báo success/error/warning/info
- **Form Validation**: React Hook Form với validation messages tiếng Việt
- **Responsive Design**: Tailwind CSS responsive trên mọi thiết bị
- **Loading States**: Feedback rõ ràng cho mọi actions

---

## 🏗️ Kiến trúc hệ thống

### Backend (NestJS + MongoDB)

```
backend/
├── src/
│   ├── auth/
│   │   ├── auth.module.ts          # Auth module configuration
│   │   ├── auth.controller.ts      # Login, Register, Refresh, Logout endpoints
│   │   ├── auth.service.ts         # Token generation, validation logic
│   │   ├── jwt.strategy.ts         # Passport JWT strategy
│   │   └── jwt-auth.guard.ts       # Route protection guard
│   ├── user/
│   │   ├── user.schema.ts          # User model với refreshToken fields
│   │   └── ...
│   └── main.ts                     # App bootstrap
```

**Key Endpoints:**
- `POST /auth/register` - Đăng ký user mới
- `POST /auth/login` - Đăng nhập, trả về access + refresh tokens
- `POST /auth/refresh` - Làm mới access token bằng refresh token
- `POST /auth/logout` - Xóa refresh token khỏi database

### Frontend (React + Vite)

```
frontend/
├── src/
│   ├── api/
│   │   └── client.js               # Axios instance với interceptors
│   ├── components/
│   │   └── ProtectedRoute.jsx      # Route guard component
│   ├── context/
│   │   ├── AuthContext.jsx         # Global auth state
│   │   └── ToastContext.jsx        # Toast notifications
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Login.jsx               # Login form với React Hook Form
│   │   ├── SignUp.jsx              # Registration form
│   │   └── Profile.jsx             # Protected page
│   └── App.jsx                     # Routes configuration
```

---

## 🔐 Security Best Practices

### 1. **Access Token in Memory**
- Không lưu access token trong localStorage
- Tránh XSS attacks đánh cắp token
- Reset khi refresh page (dùng refresh token để restore)

### 2. **Refresh Token in LocalStorage**
- Chỉ lưu refresh token trong localStorage
- Hash trong database với bcrypt
- Có expiry date kiểm tra server-side

### 3. **Token Rotation**
- Mỗi lần refresh tạo cặp token MỚI
- Invalidate old refresh token
- Ngăn chặn token replay attacks

### 4. **HTTPS Only** (Production)
- Tất cả communication qua HTTPS
- Railway và Vercel tự động enable HTTPS

### 5. **Password Hashing**
- Bcrypt với salt rounds = 10
- Không bao giờ lưu plain text password

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (hoặc local MongoDB)
- npm hoặc yarn

### Backend Setup

```bash
cd backend
npm install

# Tạo file .env
cat > .env << EOF
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key_min_32_characters
PORT=3333
NODE_ENV=development
EOF

# Build và start
npm run build
npm start
# Backend chạy tại http://localhost:3333
```

### Frontend Setup

```bash
cd frontend
npm install

# Development
npm run dev
# App chạy tại http://localhost:5173
```

---

## 📡 API Documentation

### POST /auth/register
**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "fullName": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "user@example.com",
    "fullName": "John Doe"
  }
}
```

### POST /auth/login
**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "user@example.com",
    "fullName": "John Doe",
    "nights": 0
  }
}
```

### POST /auth/refresh
**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "accessToken": "new_access_token",
  "refreshToken": "new_refresh_token"
}
```

### POST /auth/logout
**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 🧪 Testing Authentication Flow

### 1. Register New User
```bash
curl -X POST http://localhost:3333/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "fullName": "Test User"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3333/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234"
  }'
```

### 3. Access Protected Route
```bash
curl -X GET http://localhost:3333/user/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Refresh Token
```bash
curl -X POST http://localhost:3333/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

---

## 🌐 Deployment

### Backend (Railway)
1. Push code to GitHub
2. Connect Railway to repository
3. Set environment variables:
   ```
   MONGO_URI=mongodb+srv://...
   JWT_SECRET=your-secret-key
   PORT=3333
   ```
4. Railway auto-deploys on push

### Frontend (Vercel)
1. Connect Vercel to GitHub repository
2. Set Root Directory: `frontend`
3. Set environment variable:
   ```
   VITE_API_BASE=https://your-backend.railway.app
   ```
4. Vercel auto-deploys on push

**Live URLs:**
- Backend: `https://ia03-user-registration-production.up.railway.app`
- Frontend: `https://ia-03-user-registration-backend-p74ivolb3.vercel.app`

---

## 📊 Evaluation Criteria Checklist

| Criteria | Points | Status |
|----------|--------|--------|
| **Authentication logic** | 30% | ✅ Access + Refresh tokens implemented |
| **Axios interceptor** | 20% | ✅ Request & response interceptors with auto-refresh |
| **React Query integration** | 15% | ✅ useMutation for auth, useQuery for data |
| **React Hook Form** | 10% | ✅ Login & Register forms with validation |
| **Public hosting** | 10% | ✅ Railway + Vercel deployed |
| **UI/UX** | 10% | ✅ Toast notifications, responsive design |
| **Error handling** | 5% | ✅ Global exception filter, field validation |

**Total: 100%** ✅

---

## 🔧 Tech Stack

### Backend
- NestJS 9.x - Progressive Node.js framework
- MongoDB + Mongoose - Database
- Passport JWT - Authentication strategy
- bcrypt - Password hashing
- class-validator - DTO validation

### Frontend
- React 18.2 - UI library
- Vite 5 - Build tool
- React Router 6 - Routing
- React Query 4 - Server state management
- React Hook Form 7 - Form handling
- Axios - HTTP client
- Tailwind CSS 3 - Styling
- jwt-decode - Token parsing

---

## 📝 Additional Features (Stretch Goals)

### ✅ Implemented
- Token rotation on refresh
- Global exception handling
- Vietnamese localization
- Toast notification system
- Protected route guards

### 🔜 Future Enhancements
- Silent token refresh before expiration
- Multi-tab synchronization
- Role-based access control (RBAC)
- Email verification
- Password reset flow
- Remember me checkbox
- Session management dashboard

---

## 👨‍💻 Author

**MSSV: 22120159**  
**Project**: IA03 - React JWT Authentication  
**Date**: November 2025

---

## 📄 License

MIT License - Educational purposes only
