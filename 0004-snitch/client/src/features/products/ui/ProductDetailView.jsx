import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, ShieldCheck, Truck, RefreshCw } from 'lucide-react'

export const ProductDetailView = ({
  product,
  onAddToCart,
  isAddingToCart = false,
  cartError = null,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [validationError, setValidationError] = useState('')
  const [addedSuccess, setAddedSuccess] = useState(false)

  if (!product) return null

  const images = product.images?.length
    ? product.images
    : [
        {
          url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
          order: 1,
        },
      ]

  const activeImage = images[selectedImageIndex]?.url || images[0]?.url

  // Find stock for selected size
  const selectedSizeObj = product.sizes?.find((s) => s.size === selectedSize)
  const currentStock = selectedSizeObj ? selectedSizeObj.stock : 0

  const handleSizeSelect = (sizeObj) => {
    if (sizeObj.stock > 0) {
      setSelectedSize(sizeObj.size)
      setValidationError('')
      setQuantity(1)
    }
  }

  const handleQuantityChange = (delta) => {
    const next = quantity + delta
    if (next >= 1 && next <= currentStock) {
      setQuantity(next)
    }
  }

  const handleAddToCart = async () => {
    if (!selectedSize) {
      setValidationError('Please select a size first')
      return
    }

    if (currentStock <= 0) {
      setValidationError('Selected size is out of stock')
      return
    }

    setValidationError('')
    const success = await onAddToCart({
      productId: product._id || product.id,
      size: selectedSize,
      quantity,
    })

    if (success) {
      setAddedSuccess(true)
      setTimeout(() => setAddedSuccess(false), 3000)
    }
  }

  const formatPrice = (amount, currency = 'INR') => {
    if (currency === 'INR') {
      return `₹${Number(amount || 0).toLocaleString('en-IN')}`
    }
    return `${currency} ${Number(amount || 0).toFixed(2)}`
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
      {/* Breadcrumb */}
      <nav className="text-xs uppercase tracking-eyebrow text-ink-muted mb-8 flex items-center space-x-2">
        <Link to="/" className="hover:text-ink transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link to="/products" className="hover:text-ink transition-colors">
          Shop
        </Link>
        <span>/</span>
        <span className="text-ink">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Left: Gallery (7 cols) */}
        <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:max-h-[600px] scrollbar-none">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-16 h-20 md:w-20 md:h-24 flex-shrink-0 bg-surface border transition-all ${
                    selectedImageIndex === idx ? 'border-ink' : 'border-hairline hover:border-ink/50'
                  }`}
                >
                  <img
                    src={img.url}
                    alt={`${product.title} view ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Main Large Image */}
          <div className="flex-1 aspect-[4/5] bg-surface overflow-hidden border border-hairline relative">
            <img
              src={activeImage}
              alt={product.title}
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>

        {/* Right: Product Meta & Purchase Form (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-start">
          {product.categories?.[0] && (
            <span className="text-xs uppercase tracking-eyebrow text-accent font-medium mb-2">
              {product.categories.join(' · ')}
            </span>
          )}

          <h1 className="font-serif text-3xl md:text-4xl text-ink font-normal leading-tight mb-4">
            {product.title}
          </h1>

          <div className="text-2xl font-light text-ink mb-6">
            {formatPrice(product.price?.amount, product.price?.currency)}
            <span className="text-xs text-ink-muted ml-2 font-normal">Taxes included</span>
          </div>

          <div className="border-t border-hairline py-6 space-y-6">
            {/* Size Selection */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs uppercase tracking-eyebrow text-ink font-medium">
                  Select Size {selectedSize && `— ${selectedSize}`}
                </span>
                <span className="text-xs text-ink-muted underline cursor-pointer">
                  Size Guide
                </span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {product.sizes?.map((s) => {
                  const isAvailable = s.stock > 0
                  const isSelected = selectedSize === s.size

                  return (
                    <button
                      key={s.size}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => handleSizeSelect(s)}
                      className={`h-11 flex flex-col items-center justify-center border text-xs uppercase tracking-eyebrow transition-all ${
                        !isAvailable
                          ? 'border-hairline bg-surface text-ink-muted/40 cursor-not-allowed line-through'
                          : isSelected
                          ? 'border-ink bg-ink text-canvas font-medium'
                          : 'border-hairline bg-surface text-ink hover:border-ink'
                      }`}
                    >
                      <span>{s.size}</span>
                      {isAvailable && (
                        <span className="text-[9px] opacity-70">
                          {s.stock <= 3 ? `(${s.stock} left)` : ''}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Quantity Stepper (if size selected) */}
            {selectedSize && currentStock > 0 && (
              <div>
                <span className="block text-xs uppercase tracking-eyebrow text-ink font-medium mb-2">
                  Quantity
                </span>
                <div className="flex items-center border border-hairline bg-surface w-32 h-10">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="w-10 h-full flex items-center justify-center text-ink hover:bg-canvas disabled:opacity-30"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center text-sm font-medium">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= currentStock}
                    className="w-10 h-full flex items-center justify-center text-ink hover:bg-canvas disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Errors */}
            {(validationError || cartError) && (
              <div className="p-3 bg-critical/10 border border-critical text-critical text-xs">
                {validationError || cartError}
              </div>
            )}

            {/* Add to Bag CTA */}
            <button
              type="button"
              disabled={isAddingToCart}
              onClick={handleAddToCart}
              className={`w-full h-12 text-xs uppercase tracking-eyebrow font-medium transition-all flex items-center justify-center ${
                addedSuccess
                  ? 'bg-positive text-canvas'
                  : 'bg-ink text-canvas hover:bg-ink/90 disabled:opacity-50'
              }`}
            >
              {isAddingToCart ? (
                <span className="inline-block animate-spin border-2 border-canvas border-t-transparent rounded-full w-4 h-4 mr-2" />
              ) : addedSuccess ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Added to Bag
                </>
              ) : (
                'Add to Bag'
              )}
            </button>
          </div>

          {/* Description */}
          <div className="border-t border-hairline pt-6">
            <h4 className="text-xs uppercase tracking-eyebrow text-ink font-medium mb-3">
              Description & Details
            </h4>
            <p className="text-sm text-ink-muted leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Value props */}
          <div className="border-t border-hairline mt-6 pt-6 space-y-3">
            <div className="flex items-center gap-3 text-xs text-ink-muted">
              <Truck className="w-4 h-4 text-ink" />
              <span>Complimentary standard shipping across India</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-ink-muted">
              <RefreshCw className="w-4 h-4 text-ink" />
              <span>Easy 7-day exchanges & returns</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-ink-muted">
              <ShieldCheck className="w-4 h-4 text-ink" />
              <span>100% Authentic crafted menswear guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
