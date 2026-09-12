import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useProducts } from '../features/products/hooks/useProducts'
import { useCart } from '../features/cart/hooks/useCart'
import { ProductDetailView } from '../features/products/ui/ProductDetailView'
import { ArrowLeft } from 'lucide-react'

export const ProductDetailPage = () => {
  const { id } = useParams()
  const { allProducts, isLoading: isProductsLoading, loadProducts } = useProducts(true)
  const { addToCart, isLoading: isAddingToCart, error: cartError } = useCart()

  const [product, setProduct] = useState(null)
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false)

  useEffect(() => {
    if (allProducts.length > 0) {
      const found = allProducts.find((p) => (p._id || p.id) === id)
      setProduct(found || null)
      setHasAttemptedFetch(true)
    } else {
      loadProducts(1).then(() => {
        setHasAttemptedFetch(true)
      })
    }
  }, [id, allProducts, loadProducts])

  if (isProductsLoading && !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <span className="inline-block animate-spin border-2 border-ink border-t-transparent rounded-full w-8 h-8" />
        <p className="text-xs uppercase tracking-eyebrow text-ink-muted mt-4">
          Loading garment details...
        </p>
      </div>
    )
  }

  if (hasAttemptedFetch && !product) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center border border-hairline bg-surface my-12">
        <h2 className="font-serif text-3xl text-ink mb-2">Garment Not Found</h2>
        <p className="text-xs uppercase tracking-eyebrow text-ink-muted mb-6">
          The requested garment is unavailable or no longer in catalog.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-ink text-canvas text-xs uppercase tracking-eyebrow font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Catalog
        </Link>
      </div>
    )
  }

  return (
    <ProductDetailView
      product={product}
      onAddToCart={addToCart}
      isAddingToCart={isAddingToCart}
      cartError={cartError}
    />
  )
}
