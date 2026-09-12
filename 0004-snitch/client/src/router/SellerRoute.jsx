import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../features/auth/hooks/useAuth'

export const SellerRoute = ({ children }) => {
  const { isAuthenticated, isSeller, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <span className="inline-block animate-spin border-2 border-ink border-t-transparent rounded-full w-8 h-8" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  if (!isSeller) {
    return <Navigate to="/account" replace />
  }

  return children
}
