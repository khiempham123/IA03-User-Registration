import React from 'react'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user, isAuthenticated, incrementNights } = useAuth()

  if (!isAuthenticated) {
    return (
      <section className="mt-8 bg-white rounded p-6 shadow">
        <h1 className="text-2xl font-bold mb-2">Welcome</h1>
        <p className="text-gray-700">Vui lòng đăng nhập.</p>
      </section>
    )
  }

  return (
    <section className="mt-8 bg-white rounded p-6 shadow">
      <h1 className="text-2xl font-bold mb-2">Welcome, {user.email}</h1>
      <p className="mb-4">Số đêm hiện tại: <strong>{user.nights || 0}</strong></p>
      <button onClick={incrementNights} className="bg-blue-600 text-white px-4 py-2 rounded">Tăng số đêm</button>
    </section>
  )
}
