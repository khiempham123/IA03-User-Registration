import React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { api } from '../api/client'

export default function Home() {
  const { user, isAuthenticated, updateUser } = useAuth()
  const { addToast } = useToast()
  const queryClient = useQueryClient()

  // Increment nights mutation
  const incrementMutation = useMutation({
    mutationFn: async () => {
      const currentNights = user?.nights || 0
      const newNights = currentNights + 1
      const res = await api.put('/user/profile', { nights: newNights })
      return res.data.user || res.data
    },
    onSuccess: (updated) => {
      updateUser({ nights: updated.nights })
      queryClient.invalidateQueries(['profile'])
      addToast(`Số đêm đã tăng lên ${updated.nights}!`, 'success')
    },
    onError: (error) => {
      const errorMsg = error.response?.data?.message || 'Không thể cập nhật số đêm'
      addToast(errorMsg, 'error')
    },
  })

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
      <button 
        onClick={() => incrementMutation.mutate()}
        disabled={incrementMutation.isPending}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {incrementMutation.isPending ? 'Đang cập nhật...' : 'Tăng số đêm'}
      </button>
    </section>
  )
}
