import Brand from './Brand.jsx'

const currentYear = new Date().getFullYear()

export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--canvas)] px-5">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between py-7">
        <Brand />
        <span className="text-sm text-[var(--muted)]">Private workspace</span>
      </header>
      <main className="flex flex-1 items-center justify-center py-10 sm:py-14">
        <section className="w-full max-w-[440px] rounded-lg border border-[var(--line)] bg-[var(--paper)] px-6 py-9 shadow-[0_18px_55px_rgba(32,42,37,0.045)] sm:px-10 sm:py-11">
          {children}
        </section>
      </main>
      <footer className="mx-auto flex w-full max-w-6xl justify-between border-t border-[var(--line)] py-5 text-xs text-[var(--muted)]">
        <span>© {currentYear} Athena</span>
        <span>Account access</span>
      </footer>
    </div>
  )
}