import React from 'react'
import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

export const NotFoundPage = () => {
  return (
    <div className="max-w-md mx-auto py-24 px-4 text-center">
      <span className="text-xs uppercase tracking-eyebrow text-accent font-medium block mb-2">
        404 · Page Not Found
      </span>
      <h1 className="font-serif text-4xl sm:text-5xl text-ink font-normal mb-4">
        Lost in the Archive
      </h1>
      <p className="text-xs uppercase tracking-eyebrow text-ink-muted mb-8">
        The page you are looking for might have been moved, renamed, or is temporarily unavailable.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-8 py-3 bg-ink text-canvas text-xs uppercase tracking-eyebrow font-medium hover:bg-ink/90 transition-colors"
      >
        <Home className="w-4 h-4" />
        Return Home
      </Link>
    </div>
  )
}
