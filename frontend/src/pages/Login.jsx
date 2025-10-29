import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { api } from '../api/client'

export default function Login() {
  const { register, handleSubmit, formState } = useForm()
  const { errors } = formState
  const navigate = useNavigate()
  const { login } = useAuth()
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const response = await api.post('/user/login', data)
      const { token, user } = response.data
      login(user.email, token)
      addToast('Đăng nhập thành công!', 'success')
      navigate('/')
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Đăng nhập thất bại'
      addToast(errorMessage, 'error')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mt-8 bg-white rounded p-6 shadow max-w-md">
      <h2 className="text-xl font-semibold mb-4">Đăng nhập</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input 
            {...register('email', { 
              required: 'Email là bắt buộc',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Email không hợp lệ'
              }
            })} 
            className="mt-1 block w-full border rounded px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
          />
          {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Mật khẩu</label>
          <input 
            type="password" 
            {...register('password', { 
              required: 'Mật khẩu là bắt buộc',
              minLength: {
                value: 6,
                message: 'Mật khẩu phải có ít nhất 6 ký tự'
              }
            })} 
            className="mt-1 block w-full border rounded px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
          />
          {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <button 
            type="submit" 
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors" 
            disabled={loading}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </div>
      </form>
    </section>
  )
}
