import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user, token, logout, login } = useAuth()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const { register, handleSubmit, formState, reset } = useForm()
  const { errors } = formState

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await api.get('/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data.user
    },
    enabled: !!token
  })

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.put('/user/profile', data, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data.user
    },
    onSuccess: (updatedUser) => {
      login(updatedUser.email, token)
      setEditing(false)
      reset()
    }
  })

  if (!user) {
    return (
      <section className="mt-8 bg-white rounded p-6 shadow">
        <p>Please log in to view your profile.</p>
      </section>
    )
  }

  if (isLoading) {
    return (
      <section className="mt-8 bg-white rounded p-6 shadow">
        <p>Loading profile...</p>
      </section>
    )
  }

  const onSubmit = (data) => {
    updateMutation.mutate(data)
  }

  return (
    <section className="mt-8 bg-white rounded p-6 shadow max-w-md">
      <h2 className="text-xl font-semibold mb-4">Profile</h2>

      {!editing ? (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-600">Email</label>
            <p className="text-base">{profileData?.email || user.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Nights</label>
            <p className="text-base">{user.nights || 0}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Created At</label>
            <p className="text-base">{profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : 'N/A'}</p>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => setEditing(true)} className="bg-blue-600 text-white px-4 py-2 rounded">
              Edit Email
            </button>
            <button onClick={() => { logout(); navigate('/login') }} className="bg-red-600 text-white px-4 py-2 rounded">
              Logout
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">New Email</label>
            <input
              {...register('email', { required: true, pattern: /^\S+@\S+$/i })}
              className="mt-1 block w-full border rounded px-3 py-2"
              defaultValue={profileData?.email || user.email}
            />
            {errors.email && <p className="text-sm text-red-600">Valid email is required.</p>}
          </div>

          <div className="flex gap-2">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded" disabled={updateMutation.isLoading}>
              {updateMutation.isLoading ? 'Saving...' : 'Save'}
            </button>
            <button type="button" onClick={() => { setEditing(false); reset() }} className="bg-gray-400 text-white px-4 py-2 rounded">
              Cancel
            </button>
          </div>

          {updateMutation.isError && (
            <div className="text-red-700">{updateMutation.error?.response?.data?.message || 'Update failed'}</div>
          )}
        </form>
      )}
    </section>
  )
}
