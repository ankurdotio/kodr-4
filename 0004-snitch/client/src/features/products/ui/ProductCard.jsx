import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false)

  if (!product) return null

  const id = product._id || product.id
  const images = product.images || []
  const firstImage = images[0]?.url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80'
  const secondImage = images[1]?.url || firstImage
  const currentImage = isHovered && images.length > 1 ? secondImage : firstImage

  // Check if any size has stock
  const isOutOfStock = product.sizes && product.sizes.every((s) => s.stock === 0)

  const formatPrice = (amount, currency = 'INR') => {
    if (currency === 'INR') {
      return `₹${Number(amount || 0).toLocaleString('en-IN')}`
    }
    return `${currency} ${Number(amount || 0).toFixed(2)}`
  }

  return (
    <Link
      to={`/products/${id}`}
      className="group block relative cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container 4:5 ratio */}
      <div className="relative aspect-[4/5] bg-surface overflow-hidden mb-3">
        <img
          src={currentImage}
          alt={product.title}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isOutOfStock ? (
            <span className="px-2 py-0.5 bg-critical text-canvas text-[10px] uppercase tracking-eyebrow font-medium">
              Sold Out
            </span>
          ) : product.categories?.[0] ? (
            <span className="px-2 py-0.5 bg-canvas/90 backdrop-blur-xs border border-hairline text-ink text-[10px] uppercase tracking-eyebrow">
              {product.categories[0]}
            </span>
          ) : null}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col space-y-1">
        <h3 className="text-sm font-normal text-ink group-hover:text-accent transition-colors line-clamp-1">
          {product.title}
        </h3>
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-ink">
            {formatPrice(product.price?.amount, product.price?.currency)}
          </span>
          {product.sizes && product.sizes.length > 0 && (
            <span className="text-[11px] text-ink-muted">
              {product.sizes.filter((s) => s.stock > 0).map((s) => s.size).join(' · ')}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
