import React from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function SignUp() {
  const { register, handleSubmit, formState, watch } = useForm()
  const { errors } = formState
  const navigate = useNavigate()
  const { login } = useAuth()
  const { addToast } = useToast()

  const mutation = useMutation({
    mutationFn: (data) => api.post('/user/register', data),
    onSuccess: async (response, variables) => {
      addToast('Đăng ký thành công!', 'success')
      // Auto-login after registration
      try {
        const loginResp = await api.post('/user/login', { 
          email: variables.email, 
          password: variables.password 
        })
        const { token, user } = loginResp.data
        login(user.email, token)
        navigate('/')
      } catch (err) {
        addToast('Đăng ký thành công! Vui lòng đăng nhập.', 'warning')
        navigate('/login')
      }
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Đăng ký thất bại'
      addToast(errorMessage, 'error')
    }
  })

  const onSubmit = async (data) => {
    mutation.mutate(data)
  }

  return (
    <section className="mt-8 bg-white rounded p-6 shadow max-w-md">
      <h2 className="text-xl font-semibold mb-4">Đăng ký</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Họ tên</label>
          <input 
            {...register('fullName', { 
              required: 'Họ tên là bắt buộc',
              minLength: {
                value: 2,
                message: 'Họ tên phải có ít nhất 2 ký tự'
              }
            })} 
            className="mt-1 block w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          />
          {errors.fullName && <p className="text-sm text-red-600 mt-1">{errors.fullName.message}</p>}
        </div>

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
            className="mt-1 block w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
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
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: 'Mật khẩu phải chứa chữ hoa, chữ thường và số'
              }
            })} 
            className="mt-1 block w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          />
          {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Xác nhận mật khẩu</label>
          <input 
            type="password" 
            {...register('confirmPassword', { 
              required: 'Vui lòng xác nhận mật khẩu',
              validate: (value) => value === watch('password') || 'Mật khẩu không khớp'
            })} 
            className="mt-1 block w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          />
          {errors.confirmPassword && <p className="text-sm text-red-600 mt-1">{errors.confirmPassword.message}</p>}
        </div>

        <div>
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors" 
            disabled={mutation.isLoading}
          >
            {mutation.isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </div>
      </form>
    </section>
  )
}
