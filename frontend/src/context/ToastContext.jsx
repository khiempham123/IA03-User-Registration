import React, { createContext, useContext, useState } from 'react'

const ToastContext = createContext()

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = (message, type = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      removeToast(id)
    }, 5000)
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded shadow-lg text-white max-w-sm animate-fade-in ${
              toast.type === 'error' ? 'bg-red-600' :
              toast.type === 'success' ? 'bg-green-600' :
              toast.type === 'warning' ? 'bg-yellow-600' :
              'bg-blue-600'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-white hover:text-gray-200 font-bold"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}
