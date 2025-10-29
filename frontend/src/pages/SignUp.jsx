import React from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function SignUp() {
  const { register, handleSubmit, formState } = useForm()
  const { errors } = formState
  const navigate = useNavigate()
  const { login } = useAuth()

  const mutation = useMutation({
    mutationFn: (data) => api.post('/user/register', data),
    onSuccess: async (response, variables) => {
      // Auto-login after registration
      try {
        const loginResp = await api.post('/user/login', { email: variables.email, password: variables.password })
        const { token, user } = loginResp.data
        login(user.email, token)
        navigate('/')
      } catch (err) {
        // If auto-login fails, just show success message
        console.error('Auto-login failed:', err)
      }
    }
  })

  const onSubmit = async (data) => {
    mutation.mutate(data)
  }

  return (
    <section className="mt-8 bg-white rounded p-6 shadow max-w-md">
      <h2 className="text-xl font-semibold mb-4">Sign Up</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input {...register('email', { required: true })} className="mt-1 block w-full border rounded px-3 py-2" />
          {errors.email && <p className="text-sm text-red-600">Email is required and must be valid.</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Password</label>
          <input type="password" {...register('password', { required: true, minLength: 6 })} className="mt-1 block w-full border rounded px-3 py-2" />
          {errors.password && <p className="text-sm text-red-600">Password is required (min 6 chars).</p>}
        </div>

        <div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded" disabled={mutation.isLoading}>
            {mutation.isLoading ? 'Registering...' : 'Sign Up'}
          </button>
        </div>
      </form>

      {mutation.isError && (
        <div className="mt-4 text-red-700">{mutation.error?.response?.data?.message || 'Registration failed'}</div>
      )}

      {mutation.isSuccess && (
        <div className="mt-4 text-green-700">Registration successful. You can now log in.</div>
      )}
    </section>
  )
}
