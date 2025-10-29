import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'

export default function Login() {
  const { register, handleSubmit, formState } = useForm()
  const { errors } = formState
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const onSubmit = async (data) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.post('/user/login', data)
      const { token, user } = response.data
      login(user.email, token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mt-8 bg-white rounded p-6 shadow max-w-md">
      <h2 className="text-xl font-semibold mb-4">Login</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input {...register('email', { required: true })} className="mt-1 block w-full border rounded px-3 py-2" />
          {errors.email && <p className="text-sm text-red-600">Email is required.</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Password</label>
          <input type="password" {...register('password', { required: true })} className="mt-1 block w-full border rounded px-3 py-2" />
          {errors.password && <p className="text-sm text-red-600">Password is required.</p>}
        </div>

        <div>
          <button type="submit" className="w-full bg-green-600 text-white py-2 rounded" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </form>

      {error && <div className="mt-4 text-red-700">{error}</div>}
    </section>
  )
}
