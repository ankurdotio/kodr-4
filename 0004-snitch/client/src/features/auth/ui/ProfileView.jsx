import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { Link, useNavigate } from 'react-router-dom'
import { Package, Shield, User as UserIcon, LogOut, ArrowRight } from 'lucide-react'

export const ProfileView = () => {
  const { user, isSeller, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    signOut()
    navigate('/')
  }

  if (!user) {
    return (
      <div className="py-20 text-center">
        <p className="text-ink-muted mb-4">You are not signed in.</p>
        <Link
          to="/auth/login"
          className="inline-block px-8 py-3 bg-ink text-canvas text-xs uppercase tracking-eyebrow"
        >
          Sign In
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div className="border-b border-hairline pb-8 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-eyebrow text-ink-muted">Account Profile</span>
          <h1 className="font-serif text-3xl md:text-4xl text-ink font-normal mt-1">
            {user.name}
          </h1>
          <p className="text-sm text-ink-muted mt-1">{user.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 text-xs uppercase tracking-eyebrow bg-sand/30 border border-hairline text-ink">
            {user.role || 'user'}
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-4 py-2 border border-hairline hover:border-ink text-xs uppercase tracking-eyebrow text-ink transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/orders"
          className="group block p-6 bg-surface border border-hairline hover:border-ink transition-all"
        >
          <div className="flex items-start justify-between">
            <div className="p-3 bg-canvas border border-hairline">
              <Package className="w-6 h-6 text-ink" />
            </div>
            <ArrowRight className="w-4 h-4 text-ink-muted group-hover:text-ink group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="font-serif text-xl text-ink mt-4 mb-1">My Orders</h3>
          <p className="text-xs text-ink-muted">
            Track orders, view receipts, and check delivery status.
          </p>
        </Link>

        {isSeller && (
          <Link
            to="/seller"
            className="group block p-6 bg-surface border border-hairline hover:border-ink transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="p-3 bg-canvas border border-hairline">
                <Shield className="w-6 h-6 text-ink" />
              </div>
              <ArrowRight className="w-4 h-4 text-ink-muted group-hover:text-ink group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-serif text-xl text-ink mt-4 mb-1">Seller Dashboard</h3>
            <p className="text-xs text-ink-muted">
              Manage inventory, publish new products, and track buyer orders.
            </p>
          </Link>
        )}

        <div className="p-6 bg-surface border border-hairline md:col-span-2">
          <h4 className="text-xs uppercase tracking-eyebrow text-ink font-medium mb-4">
            Personal Details
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-canvas border border-hairline">
              <span className="text-xs uppercase text-ink-muted block mb-1">Name</span>
              <span className="text-ink font-medium">{user.name}</span>
            </div>
            <div className="p-3 bg-canvas border border-hairline">
              <span className="text-xs uppercase text-ink-muted block mb-1">Email</span>
              <span className="text-ink font-medium">{user.email}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
