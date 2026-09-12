import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export const LoginForm = ({ onSuccess, onSwitchToRegister }) => {
  const { login, isLoading, error, clearError } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [localError, setLocalError] = useState('')

  const handleChange = (e) => {
    if (error) clearError()
    if (localError) setLocalError('')
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      setLocalError('Please fill in all required fields.')
      return
    }

    const success = await login(formData)
    if (success && onSuccess) {
      onSuccess()
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl md:text-4xl text-ink font-normal mb-2">
          Welcome Back
        </h2>
        <p className="text-xs uppercase tracking-eyebrow text-ink-muted">
          Sign in to access your account & bag
        </p>
      </div>

      {(error || localError) && (
        <div className="mb-6 p-4 bg-critical/10 border border-critical text-critical text-sm">
          {error || localError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs uppercase tracking-eyebrow text-ink mb-2">
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
            placeholder="name@example.com"
            className="w-full bg-surface border border-hairline px-4 py-3 text-ink text-sm placeholder:text-ink-muted/50 focus:outline-none focus:border-ink transition-colors"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs uppercase tracking-eyebrow text-ink">
              Password *
            </label>
            <span className="text-xs text-ink-muted hover:text-ink cursor-pointer transition-colors">
              Forgot?
            </span>
          </div>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full bg-surface border border-hairline px-4 py-3 text-ink text-sm placeholder:text-ink-muted/50 focus:outline-none focus:border-ink transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-ink text-canvas text-xs uppercase tracking-eyebrow font-medium hover:bg-ink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <span className="inline-block animate-spin border-2 border-canvas border-t-transparent rounded-full w-4 h-4 mr-2" />
          ) : null}
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      {onSwitchToRegister && (
        <div className="mt-8 pt-6 border-t border-hairline text-center">
          <p className="text-xs text-ink-muted">
            Don't have an account yet?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-ink underline uppercase tracking-eyebrow font-medium ml-1 hover:text-accent transition-colors"
            >
              Create Account
            </button>
          </p>
        </div>
      )}
    </div>
  )
}
