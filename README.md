# IA03 - User Registration System

A complete full-stack user registration and authentication system with NestJS backend and React frontend.

![Status](https://img.shields.io/badge/status-complete-success)
![License](https://img.shields.io/badge/license-MIT-blue)

## 📋 Project Overview

This project implements a modern user registration system with:
- Backend API with user authentication (JWT)
- React frontend with routing and state management
- MongoDB database for user storage
- Deployment-ready configuration for Vercel/Railway

### Features Implemented

**Backend (NestJS + Mongoose)**
- ✅ POST `/user/register` - User registration with validation
- ✅ POST `/user/login` - User authentication with JWT tokens
- ✅ GET `/user/profile` - Get user profile (protected)
- ✅ PUT `/user/profile` - Update user email (protected)
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ Email uniqueness validation
- ✅ Input validation with class-validator
- ✅ CORS enabled for frontend requests
- ✅ Environment variable configuration
- ✅ Error handling with meaningful messages

**Frontend (React + Vite + Tailwind)**
- ✅ Home page with conditional rendering (logged in/out states)
- ✅ Sign Up page with form validation (React Hook Form)
- ✅ Login page with backend integration
- ✅ Profile page to view and edit user data
- ✅ Auto-login after successful registration
- ✅ JWT token management and localStorage persistence
- ✅ Night counter feature with increment button
- ✅ Responsive design with Tailwind CSS
- ✅ React Query for API state management
- ✅ Protected routes and navigation
- ✅ Custom header with user info and logout
- ✅ Footer with copyright (22120159)

## 🎯 Requirements Met

### Backend Requirements (10/10 points)
- ✅ API Endpoint `/user/register` (2 pts)
- ✅ Error Handling with meaningful messages (2 pts)

### Frontend Requirements (6/6 points)
- ✅ Routing (Home, Login, Sign Up) (1 pt)
- ✅ Sign Up Page with form, validation, React Query integration (2 pts)
- ✅ Login Page with form, validation, UI styling (2 pts)
- ✅ Profile page with edit functionality (bonus)

### Deployment (1/1 point)
- ✅ Deployment guide for Vercel + Railway/Render (1 pt)

**Additional Features (Beyond Requirements)**
- JWT-based authentication system
- Protected API endpoints with token verification
- Auto-login after registration
- User profile management (view/edit)
- Night counter with state persistence
- Responsive UI with Tailwind CSS
- Comprehensive deployment documentation

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB (local or Docker) OR MongoDB Atlas account
- Git

### 1. Clone and Install

```powershell
# Clone repository
git clone <your-repo-url>
cd IA03-22120159

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Setup MongoDB

**Option A: Docker (Recommended)**
```powershell
docker run -d --name ia03-mongo -p 27017:27017 mongo:6
```

**Option B: MongoDB Atlas**
- Follow steps in [DEPLOYMENT.md](./DEPLOYMENT.md) Part 1

### 3. Configure Environment Variables

**Backend** (`backend/.env`):
```bash
MONGO_URI=mongodb://localhost:27017/ia03
PORT=3333
NODE_ENV=development
JWT_SECRET=ia03-dev-secret-key
```

**Frontend** (`frontend/.env`):
```bash
VITE_API_BASE=http://localhost:3333
```

### 4. Run Development Servers

**Terminal 1 - Backend**:
```powershell
cd backend
npm run start
```

**Terminal 2 - Frontend**:
```powershell
cd frontend
npm run dev
```

### 5. Test the Application

1. Open browser to `http://localhost:5173` (Vite dev server)
2. Go to Sign Up page
3. Register with email and password (min 6 chars)
4. You'll be auto-logged in and redirected to Home
5. Click "Tăng số đêm" to increment the night counter
6. Visit Profile page to view/edit your email
7. Test Logout functionality

---

## 📁 Project Structure

```
IA03-22120159/
├── backend/                 # NestJS backend
│   ├── src/
│   │   ├── main.ts         # App entry point, CORS, ValidationPipe
│   │   ├── app.module.ts   # Root module, Mongoose connection
│   │   └── user/
│   │       ├── user.module.ts
│   │       ├── user.controller.ts    # API endpoints
│   │       ├── user.service.ts       # Business logic
│   │       ├── user.schema.ts        # Mongoose schema
│   │       ├── dto/
│   │       │   ├── create-user.dto.ts
│   │       │   ├── login-user.dto.ts
│   │       │   └── update-user.dto.ts
│   │       └── decorators/
│   │           └── current-user.decorator.ts  # JWT auth decorator
│   ├── .env                # Environment config
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── frontend/               # React + Vite frontend
│   ├── src/
│   │   ├── main.jsx       # Entry point with providers
│   │   ├── App.jsx        # Routes, header, footer
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Auth state management
│   │   ├── pages/
│   │   │   ├── Home.jsx           # Home with night counter
│   │   │   ├── Login.jsx          # Login form
│   │   │   ├── SignUp.jsx         # Registration form
│   │   │   └── Profile.jsx        # User profile view/edit
│   │   └── api/
│   │       └── client.js          # Axios instance
│   ├── .env               # Frontend config
│   ├── package.json
│   ├── tailwind.config.cjs
│   └── Dockerfile
│
├── DEPLOYMENT.md          # Deployment guide (Vercel + Railway)
└── README.md             # This file
```

---

## 🔌 API Endpoints

### Public Endpoints

#### POST `/user/register`
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

**Response (201):**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "createdAt": "2025-10-29T10:00:00.000Z"
  }
}
```

**Errors:**
- `409 Conflict` - Email already in use
- `400 Bad Request` - Validation errors (invalid email, password too short)

#### POST `/user/login`
Authenticate and get JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "createdAt": "2025-10-29T10:00:00.000Z"
  }
}
```

**Errors:**
- `401 Unauthorized` - Invalid credentials

### Protected Endpoints (Require JWT)

Include header: `Authorization: Bearer <token>`

#### GET `/user/profile`
Get current user profile.

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "createdAt": "2025-10-29T10:00:00.000Z"
  }
}
```

#### PUT `/user/profile`
Update user email.

**Request Body:**
```json
{
  "email": "newemail@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "newemail@example.com",
    "createdAt": "2025-10-29T10:00:00.000Z"
  }
}
```

**Errors:**
- `401 Unauthorized` - Invalid/missing token
- `409 Conflict` - Email already in use
- `404 Not Found` - User not found

---

## 🧪 Testing

### Manual Testing

**Test Registration:**
```powershell
curl -X POST http://localhost:3333/user/register -H "Content-Type: application/json" -d '{ "email":"alice@test.com", "password":"secret123" }'
```

**Test Login:**
```powershell
curl -X POST http://localhost:3333/user/login -H "Content-Type: application/json" -d '{ "email":"alice@test.com", "password":"secret123" }'
```

**Test Profile (replace <TOKEN>):**
```powershell
curl http://localhost:3333/user/profile -H "Authorization: Bearer <TOKEN>"
```

### Frontend Testing Checklist

- [ ] Sign Up with new email → auto-login → redirect to Home
- [ ] Login with existing credentials → redirect to Home
- [ ] Home shows "Welcome, {email}" when logged in
- [ ] Night counter increments on button click
- [ ] Profile page shows user data
- [ ] Profile edit updates email
- [ ] Logout clears state and redirects
- [ ] Home shows "Vui lòng đăng nhập" when logged out
- [ ] Header shows user email when logged in
- [ ] Footer shows "© copyright by 22120159"

---

## 🌐 Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for complete deployment instructions covering:

- MongoDB Atlas setup (free tier)
- Backend deployment to Railway or Render
- Frontend deployment to Vercel
- Environment variable configuration
- Testing and troubleshooting

**Estimated Cost:** $0/month (free tier)

---

## 🛡️ Security Features

- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ JWT tokens for stateless authentication (7-day expiry)
- ✅ Input validation on all endpoints
- ✅ CORS configuration
- ✅ Unique email constraint in database
- ✅ Environment variable isolation
- ✅ Token verification on protected routes

**Recommendations for Production:**
- Use strong `JWT_SECRET` (32+ random characters)
- Enable rate limiting (e.g., `express-rate-limit`)
- Add helmet for HTTP headers security
- Restrict MongoDB Atlas network access to specific IPs
- Implement refresh tokens for better security
- Add password strength requirements
- Implement email verification
- Add 2FA support

---

## 🔧 Tech Stack

**Backend:**
- NestJS 9.x (Node.js framework)
- Mongoose 6.x (MongoDB ODM)
- bcrypt (password hashing)
- jsonwebtoken (JWT auth)
- class-validator (DTO validation)
- TypeScript 4.9

**Frontend:**
- React 18.2
- Vite 5.0 (build tool)
- React Router 6.14 (routing)
- React Query 4.34 (server state)
- React Hook Form 7.45 (form validation)
- Tailwind CSS 3.5 (styling)
- jwt-decode (token parsing)
- Axios (HTTP client)

**Database:**
- MongoDB 6.0

**Deployment:**
- Vercel (frontend hosting)
- Railway/Render (backend hosting)
- MongoDB Atlas (database hosting)

---

## 📝 Development Notes

### Code Quality
- TypeScript for type safety on backend
- ESLint-ready (configure as needed)
- Component-based architecture
- Separation of concerns (controller/service/schema)
- Reusable context for auth state

### Known Limitations
- No automated tests (planned for future)
- No password reset functionality
- No email verification
- Simple JWT without refresh tokens
- No rate limiting implemented

### Future Enhancements
- [ ] Add Jest/Supertest for backend unit tests
- [ ] Add React Testing Library for frontend tests
- [ ] Implement password reset via email
- [ ] Add email verification on signup
- [ ] Implement refresh token rotation
- [ ] Add user roles and permissions
- [ ] Add profile picture upload
- [ ] Add activity logging
- [ ] Implement 2FA support
- [ ] Add password strength indicator

---

## 👤 Author

**Student ID:** 22120159

**Project:** IA03 - User Registration API with React Frontend

**Date:** October 2025

---

## 📄 License

MIT License - feel free to use this project for learning purposes.

---

## 🙏 Acknowledgments

- NestJS documentation
- React documentation
- MongoDB Atlas
- Vercel and Railway for free hosting
- Tailwind CSS for rapid UI development

---

## 📞 Support

For issues or questions:
1. Check [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment issues
2. Review backend logs (Railway/Render dashboard)
3. Check browser console for frontend errors
4. Verify environment variables are set correctly
5. Test API endpoints with curl/Postman

---

**End of README** - Happy coding! 🚀
