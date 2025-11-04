import React, { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"
import { api } from "../api/client"

export default function Profile() {
  const { user, isAuthenticated, updateUser } = useAuth()
  const { addToast } = useToast()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    nights: user?.nights || 0,
  })

  // Fetch profile data
  const { data: profile, isLoading, error, refetch } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await api.get("/user/profile")
      return res.data.user || res.data
    },
    enabled: isAuthenticated,
    retry: 1, // Retry once on error
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Show error toast when query fails
  useEffect(() => {
    if (error) {
      const errorMessage = error.response?.data?.message || "Không thể tải thông tin profile"
      addToast(errorMessage, "error")
    }
  }, [error, addToast])

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: async (data) => {
      return api.put("/user/profile", data)
    },
    onSuccess: (response) => {
      const updated = response.data.user || response.data
      updateUser(updated)
      queryClient.invalidateQueries(["profile"])
      setIsEditing(false)
      addToast("Cập nhật thông tin thành công!", "success")
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || "Cập nhật thất bại"
      addToast(errorMessage, "error")
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    updateMutation.mutate({
      fullName: formData.fullName,
      email: formData.email,
    })
  }

  const incrementMutation = useMutation({
    mutationFn: async () => {
      const currentNights = profile?.nights || 0
      const newNights = currentNights + 1
      const res = await api.put("/user/profile", { nights: newNights })
      const updated = res.data.user || res.data
      return { updated, newNights }
    },
    onSuccess: ({ updated, newNights }) => {
      updateUser({ nights: newNights })
      queryClient.setQueryData(["profile"], (old) => ({
        ...(old || {}),
        ...updated,
      }))
      addToast(`Số đêm đã tăng lên ${newNights}!`, "success")
    },
    onError: (error) => {
      const errorMsg = error.response?.data?.message || "Không thể cập nhật số đêm"
      addToast(errorMsg, "error")
    },
  })

  // Sync formData when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || "",
        email: profile.email || "",
        nights: profile.nights || 0,
      })
    }
  }, [profile])

  if (isLoading) {
    return (
      <div className="mt-8 flex justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-8 max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Không thể tải thông tin</h3>
          <p className="text-gray-600 mb-4">
            {error.response?.data?.message || "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại"}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => refetch()}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return null
  }

  return (
    <div className="mt-8 max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Hồ sơ cá nhân</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Chỉnh sửa
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ tên
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                {updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false)
                  setFormData({
                    fullName: profile?.fullName || "",
                    email: profile?.email || "",
                    nights: profile?.nights || 0,
                  })
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
              >
                Hủy
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="border-b pb-4">
              <p className="text-sm text-gray-500 mb-1">Họ tên</p>
              <p className="text-lg font-medium text-gray-800">
                {profile?.fullName || "Chưa cập nhật"}
              </p>
            </div>

            <div className="border-b pb-4">
              <p className="text-sm text-gray-500 mb-1">Email</p>
              <p className="text-lg font-medium text-gray-800">
                {profile?.email}
              </p>
            </div>

            <div className="border-b pb-4">
              <p className="text-sm text-gray-500 mb-1">Số đêm</p>
              <div className="flex items-center gap-4">
                <p className="text-3xl font-bold text-blue-600">
                  {profile?.nights || 0}
                </p>
                <button
                  onClick={() => incrementMutation.mutate()}
                  disabled={incrementMutation.isPending}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {incrementMutation.isPending ? "Đang cập nhật..." : "Tăng số đêm"}
                </button>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Ngày tạo tài khoản</p>
              <p className="text-gray-700">
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString("vi-VN")
                  : "Không rõ"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}