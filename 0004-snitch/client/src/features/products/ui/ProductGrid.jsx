import React from 'react'
import { ProductCard } from './ProductCard'

export const ProductGrid = ({ products = [], isLoading = false, error = null }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 animate-pulse">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex flex-col space-y-3">
            <div className="aspect-[4/5] bg-surface border border-hairline" />
            <div className="h-4 bg-hairline w-3/4" />
            <div className="h-3 bg-hairline w-1/3" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-20 text-center border border-hairline bg-surface p-8">
        <p className="text-critical text-sm mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-ink text-canvas text-xs uppercase tracking-eyebrow"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="py-24 text-center border border-hairline bg-surface p-8">
        <h3 className="font-serif text-2xl text-ink font-normal mb-2">No Products Found</h3>
        <p className="text-xs uppercase tracking-eyebrow text-ink-muted">
          Try clearing your search filters or browse other categories.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
      {products.map((product) => (
        <ProductCard key={product._id || product.id} product={product} />
      ))}
    </div>
  )
}
