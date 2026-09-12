import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSellerProducts } from '../features/products/hooks/useSellerProducts'
import { SellerProductForm } from '../features/products/ui/SellerProductForm'
import { ArrowLeft } from 'lucide-react'

export const SellerEditProductPage = () => {
  const { id } = useParams()
  const {
    sellerProducts,
    loadSellerProducts,
    updateProduct,
    deleteImage,
    isLoading,
    error,
  } = useSellerProducts()

  const [product, setProduct] = useState(null)

  useEffect(() => {
    if (sellerProducts.length === 0) {
      loadSellerProducts(1)
    } else {
      const found = sellerProducts.find((p) => (p._id || p.id) === id)
      if (found) setProduct(found)
    }
  }, [id, sellerProducts, loadSellerProducts])

  const handleFormSubmit = async (formData) => {
    return await updateProduct(id, formData)
  }

  const handleDeleteImage = async (imageId) => {
    return await deleteImage(id, imageId)
  }

  if (!product && isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <span className="inline-block animate-spin border-2 border-ink border-t-transparent rounded-full w-8 h-8" />
        <p className="text-xs uppercase tracking-eyebrow text-ink-muted mt-4">
          Loading product...
        </p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto py-20 text-center border border-hairline bg-surface p-8 my-12">
        <h2 className="font-serif text-2xl text-ink mb-2">Product Not Found</h2>
        <p className="text-xs uppercase tracking-eyebrow text-ink-muted mb-6">
          Could not locate the requested product in your seller inventory.
        </p>
        <Link
          to="/seller"
          className="inline-flex items-center gap-2 px-6 py-3 bg-ink text-canvas text-xs uppercase tracking-eyebrow font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <div className="mb-8 flex items-center justify-between border-b border-hairline pb-6">
        <div>
          <span className="text-xs uppercase tracking-eyebrow text-ink-muted">Seller Portal</span>
          <h1 className="font-serif text-3xl md:text-4xl text-ink font-normal mt-1">
            Edit: {product.title}
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
        initialData={product}
        onSubmit={handleFormSubmit}
        onDeleteImage={handleDeleteImage}
        isLoading={isLoading}
        error={error}
      />
    </div>
  )
}
