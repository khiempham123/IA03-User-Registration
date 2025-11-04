import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import Profile from './pages/Profile'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'
import { api } from './api/client'
import { useToast } from './context/ToastContext'

export default function App() {
  const { user, logout, isAuthenticated } = useAuth()
  const { addToast } = useToast()

  const handleLogout = async () => {
    try {
      // Send userId to logout endpoint
      await api.post('/auth/logout', { userId: user?.id })
      logout()
      addToast('Đã đăng xuất thành công', 'success')
    } catch (err) {
      // Still logout on client even if server request fails
      logout()
      addToast('Đã đăng xuất', 'info')
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="font-semibold hover:text-blue-600 transition-colors">Trang chủ</Link>
            {!isAuthenticated && <Link to="/signup" className="hover:text-blue-600 transition-colors">Đăng ký</Link>}
            {!isAuthenticated && <Link to="/login" className="hover:text-blue-600 transition-colors">Đăng nhập</Link>}
            {isAuthenticated && <Link to="/profile" className="hover:text-blue-600 transition-colors">Hồ sơ</Link>}
          </div>
          <div className="text-sm text-gray-700">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span>Xin chào, <strong>{user?.fullName || user?.email}</strong></span>
                <button 
                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors" 
                  onClick={handleLogout}
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <span>Vui lòng đăng nhập</span>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-4xl mx-auto p-4 w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>

      <footer className="bg-white border-t mt-8">
        <div className="max-w-4xl mx-auto px-4 py-4 text-center text-sm text-gray-600">
          © 2025 IA03 User Registration - MSSV: 22120159
        </div>
      </footer>
    </div>
  )
}
