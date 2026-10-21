import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import AuthLayout from '../components/AuthLayout.jsx'
import PasswordField from '../components/PasswordField.jsx'

export default function AuthPage({ mode }) {
  const isRegister = mode === 'register'
  const { error, isSubmitting, login, register, clearError } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  async function handleSubmit(event) {
    event.preventDefault()
    clearError()
    const action = isRegister
      ? await register({ name, email, password })
      : await login({ email, password })

    if (action.meta.requestStatus === 'fulfilled') {
      navigate(isRegister ? '/app' : (location.state?.from ?? '/app'), { replace: true })
    }
  }

  return (
    <AuthLayout>
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--green)]">
          <span className="size-1.5 rounded-full bg-[var(--coral)]" />
          Member access
        </div>
        <h1 className="font-serif text-[34px] leading-[1.15] tracking-normal text-[var(--ink)] sm:text-[38px]">
          {isRegister ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="mt-2.5 text-sm leading-6 text-[var(--muted)]">
          {isRegister ? 'A good place to begin.' : 'Sign in to continue to Athena.'}
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {isRegister && (
          <label className="block space-y-2 text-sm font-medium text-[#39443d]" htmlFor="name">
            Full name
            <input
              autoComplete="name"
              className="w-full rounded-md border border-[#d8ded8] bg-white px-3.5 py-3 text-sm text-[var(--ink)] placeholder:text-[#9aa29b] transition focus:border-[var(--green)] focus:outline-none"
              id="name"
              maxLength={50}
              minLength={2}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
              required
              value={name}
            />
          </label>
        )}
        <label className="block space-y-2 text-sm font-medium text-[#39443d]" htmlFor="email">
          Email address
          <input
            autoComplete="email"
            className="w-full rounded-md border border-[#d8ded8] bg-white px-3.5 py-3 text-sm text-[var(--ink)] placeholder:text-[#9aa29b] transition focus:border-[var(--green)] focus:outline-none"
            id="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
            type="email"
            value={email}
          />
        </label>
        <label className="block space-y-2 text-sm font-medium text-[#39443d]" htmlFor="password">
          Password
          <PasswordField
            minLength={isRegister ? 8 : undefined}
            onChange={(event) => setPassword(event.target.value)}
            value={password}
          />
        </label>
        {isRegister && <p className="-mt-2 text-xs leading-5 text-[var(--muted)]">Use at least 8 characters, with one letter and one number.</p>}
        {error && (
          <div className="rounded-md border border-[#efd3cc] bg-[#fff7f4] px-3.5 py-3 text-sm leading-5 text-[#9b4936]" role="alert">
            {error.message}
          </div>
        )}
        <button
          className="flex w-full items-center justify-center gap-2 rounded-md bg-[var(--green)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--green-dark)] disabled:cursor-wait disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'Please wait...' : isRegister ? 'Create account' : 'Sign in'}
          {!isSubmitting && <ArrowRight size={16} strokeWidth={2} />}
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-[var(--muted)]">
        {isRegister ? 'Already have an account?' : 'New to Athena?'}{' '}
        <Link
          className="font-semibold text-[var(--green)] underline decoration-transparent underline-offset-4 transition hover:decoration-current"
          onClick={clearError}
          to={isRegister ? '/login' : '/register'}
        >
          {isRegister ? 'Sign in' : 'Create an account'}
        </Link>
      </p>
    </AuthLayout>
  )
}