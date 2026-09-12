import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export const RegisterForm = ({ onSuccess, onSwitchToLogin }) => {
  const { register, isLoading, error, clearError } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
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
    if (!formData.name || !formData.email || !formData.password) {
      setLocalError('Please fill in all required fields.')
      return
    }
    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters.')
      return
    }

    const success = await register(formData)
    if (success && onSuccess) {
      onSuccess()
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl md:text-4xl text-ink font-normal mb-2">
          Create Account
        </h2>
        <p className="text-xs uppercase tracking-eyebrow text-ink-muted">
          Join Snitch for seamless shopping & order tracking
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
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            autoComplete="name"
            placeholder="Jane Doe"
            className="w-full bg-surface border border-hairline px-4 py-3 text-ink text-sm placeholder:text-ink-muted/50 focus:outline-none focus:border-ink transition-colors"
          />
        </div>

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
          <label className="block text-xs uppercase tracking-eyebrow text-ink mb-2">
            Password *
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
            placeholder="At least 6 characters"
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
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      {onSwitchToLogin && (
        <div className="mt-8 pt-6 border-t border-hairline text-center">
          <p className="text-xs text-ink-muted">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-ink underline uppercase tracking-eyebrow font-medium ml-1 hover:text-accent transition-colors"
            >
              Sign In
            </button>
          </p>
        </div>
      )}
    </div>
  )
}
