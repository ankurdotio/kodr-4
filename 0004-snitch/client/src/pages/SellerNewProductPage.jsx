import React from 'react'
import { Link } from 'react-router-dom'
import { useSellerProducts } from '../features/products/hooks/useSellerProducts'
import { SellerProductForm } from '../features/products/ui/SellerProductForm'
import { ArrowLeft } from 'lucide-react'

export const SellerNewProductPage = () => {
  const { createProduct, isLoading, error } = useSellerProducts()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <div className="mb-8 flex items-center justify-between border-b border-hairline pb-6">
        <div>
          <span className="text-xs uppercase tracking-eyebrow text-ink-muted">Seller Portal</span>
          <h1 className="font-serif text-3xl md:text-4xl text-ink font-normal mt-1">
            Create New Product
          </h1>
        </div>
        <Link
          to="/seller"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-eyebrow text-ink hover:text-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      <SellerProductForm
        onSubmit={createProduct}
        isLoading={isLoading}
        error={error}
      />
    </div>
  )
}
