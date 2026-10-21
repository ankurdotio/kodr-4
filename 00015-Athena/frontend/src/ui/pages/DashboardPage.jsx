import { ArrowUpRight, LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.js'
import Brand from '../components/Brand.jsx'

export default function DashboardPage() {
  const { user, logout, isSubmitting } = useAuth()

  return (
    <div className="min-h-screen bg-[var(--canvas)] px-5">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between border-b border-[var(--line)] py-6">
        <Brand />
        <button
          className="inline-flex items-center gap-2 rounded-md border border-[var(--line)] bg-white px-3.5 py-2.5 text-sm font-medium text-[var(--ink)] transition hover:border-[#bec8bf] disabled:opacity-60"
          disabled={isSubmitting}
          onClick={() => logout()}
          type="button"
        >
          <LogOut size={16} strokeWidth={1.8} />
          Sign out
        </button>
      </header>

      <main className="mx-auto max-w-5xl py-16 sm:py-24">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[var(--green)]">Your account</p>
        <h1 className="max-w-2xl font-serif text-4xl leading-tight text-[var(--ink)] sm:text-5xl">
          Good to see you, {user?.name?.split(' ')[0]}.
        </h1>
        <div className="mt-12 grid max-w-2xl gap-5 border-t border-[var(--line)] pt-6 sm:grid-cols-[150px_1fr]">
          <span className="text-sm text-[var(--muted)]">Signed in as</span>
          <span className="break-all text-sm font-medium text-[var(--ink)]">{user?.email}</span>
        </div>
        <a className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-[var(--green)]" href="mailto:support@example.com">
          Account support <ArrowUpRight size={15} />
        </a>
      </main>
    </div>
  )
}