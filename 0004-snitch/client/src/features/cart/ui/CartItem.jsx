import React from 'react'
import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'

export const CartItem = ({
  item,
  onIncrement,
  onDecrement,
  onRemove,
  isDrawer = false,
}) => {
  const product = item.product || {}
  const productId = product._id || product.id
  const mainImage =
    product.images?.[0]?.url ||
    product.image ||
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80'

  const formatPrice = (amount, currency = 'INR') => {
    if (currency === 'INR') {
      return `₹${Number(amount || 0).toLocaleString('en-IN')}`
    }
    return `${currency} ${Number(amount || 0).toFixed(2)}`
  }

  const lineTotal = (product.price?.amount || 0) * item.quantity

  // Find stock for this size if available
  const sizeObj = product.sizes?.find((s) => s.size === item.size)
  const isAvailableStock = sizeObj ? sizeObj.stock >= item.quantity : true

  return (
    <div
      className={`flex gap-4 py-4 ${
        isDrawer ? 'border-b border-hairline' : 'border-b border-hairline sm:py-6'
      }`}
    >
      {/* Product Thumbnail */}
      <Link
        to={`/products/${productId}`}
        className="w-20 h-24 sm:w-24 sm:h-28 bg-surface border border-hairline flex-shrink-0 overflow-hidden"
      >
        <img
          src={mainImage}
          alt={product.title || 'Product image'}
          className="w-full h-full object-cover"
        />
      </Link>

      {/* Info & Actions */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <Link
              to={`/products/${productId}`}
              className="font-serif text-base text-ink hover:text-accent transition-colors line-clamp-1"
            >
              {product.title || 'Snitch Garment'}
            </Link>
            <button
              type="button"
              onClick={() => onRemove(item)}
              className="text-ink-muted hover:text-critical transition-colors p-1"
              title="Remove from bag"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-ink-muted mt-1">
            <span className="uppercase tracking-eyebrow">Size: {item.size}</span>
            <span>·</span>
            <span>{formatPrice(product.price?.amount, product.price?.currency)}</span>
          </div>

          {!isAvailableStock && (
            <span className="text-[11px] text-critical block mt-1">
              Limited stock: only {sizeObj?.stock} remaining
            </span>
          )}
        </div>

        {/* Quantity Controls & Line Total */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center border border-hairline bg-surface h-8">
            <button
              type="button"
              onClick={() => onDecrement(item)}
              className="w-7 h-full flex items-center justify-center text-ink hover:bg-canvas text-xs"
            >
              -
            </button>
            <span className="w-8 text-center text-xs font-medium text-ink">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onIncrement(item)}
              disabled={sizeObj && item.quantity >= sizeObj.stock}
              className="w-7 h-full flex items-center justify-center text-ink hover:bg-canvas text-xs disabled:opacity-30"
            >
              +
            </button>
          </div>

          <div className="text-right">
            <span className="text-sm font-medium text-ink">
              {formatPrice(lineTotal, product.price?.currency)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
