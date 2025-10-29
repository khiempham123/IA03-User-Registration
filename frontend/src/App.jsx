import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import Profile from './pages/Profile'
import { useAuth } from './context/AuthContext'

export default function App() {
  const { user, logout, isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="font-semibold">Home</Link>
            <Link to="/signup">Sign Up</Link>
            {!isAuthenticated && <Link to="/login">Login</Link>}
            {isAuthenticated && <Link to="/profile">Profile</Link>}
          </div>
          <div className="text-sm text-gray-700">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span>Signed in as <strong>{user.email}</strong></span>
                <button className="text-blue-600" onClick={() => logout()}>Logout</button>
              </div>
            ) : (
              <span>Please login</span>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-4xl mx-auto p-4 w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>

      <footer className="bg-white border-t mt-8">
        <div className="max-w-4xl mx-auto px-4 py-4 text-center text-sm text-gray-600">© copyright by 22120159</div>
      </footer>
    </div>
  )
}
