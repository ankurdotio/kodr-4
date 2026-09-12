import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../hooks/useCart'
import { CartItem } from './CartItem'
import { ShoppingBag, ArrowRight, ShieldCheck, Truck, RefreshCw } from 'lucide-react'

export const CartPage = () => {
  const navigate = useNavigate()
  const {
    items,
    totalPrice,
    itemCount,
    isLoading,
    error,
    incrementItem,
    decrementItem,
    removeItemCompletely,
  } = useCart()

  const formatPrice = (amount) => {
    return `₹${Number(amount || 0).toLocaleString('en-IN')}`
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="border-b border-hairline pb-6 mb-8">
        <span className="text-xs uppercase tracking-eyebrow text-ink-muted">Your Selection</span>
        <h1 className="font-serif text-3xl md:text-4xl text-ink font-normal mt-1">
          Shopping Bag ({itemCount})
        </h1>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-critical/10 border border-critical text-critical text-xs">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className="py-24 text-center border border-hairline bg-surface p-8 max-w-xl mx-auto">
          <ShoppingBag className="w-12 h-12 text-ink-muted mx-auto mb-4 stroke-1" />
          <h2 className="font-serif text-2xl text-ink mb-2">Your Bag is Empty</h2>
          <p className="text-xs uppercase tracking-eyebrow text-ink-muted mb-8">
            Explore our new collection of tailored shirts, linen tees, and premium trousers.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-8 py-3 bg-ink text-canvas text-xs uppercase tracking-eyebrow font-medium hover:bg-ink/90 transition-colors"
          >
            Start Shopping
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Items List (8 cols) */}
          <div className="lg:col-span-8 bg-surface border border-hairline p-6 sm:p-8">
            <div className="hidden sm:grid grid-cols-12 pb-4 border-b border-hairline text-[11px] uppercase tracking-eyebrow text-ink-muted">
              <span className="col-span-6">Product</span>
              <span className="col-span-3 text-center">Quantity</span>
              <span className="col-span-3 text-right">Total</span>
            </div>

            <div className="divide-y divide-hairline">
              {items.map((item, idx) => (
                <CartItem
                  key={`${item.product?._id || item.product?.id || idx}-${item.size}`}
                  item={item}
                  onIncrement={incrementItem}
                  onDecrement={decrementItem}
                  onRemove={removeItemCompletely}
                />
              ))}
            </div>
          </div>

          {/* Order Summary (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-surface border border-hairline p-6 sm:p-8 space-y-6">
              <h3 className="font-serif text-xl text-ink border-b border-hairline pb-4">
                Order Summary
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-ink-muted">
                  <span>Subtotal</span>
                  <span className="text-ink font-medium">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-ink-muted">
                  <span>Standard Shipping</span>
                  <span className="text-positive font-medium uppercase tracking-eyebrow text-xs">
                    Free
                  </span>
                </div>
                <div className="flex justify-between text-ink-muted">
                  <span>Estimated Taxes</span>
                  <span className="text-xs text-ink-muted">Included</span>
                </div>

                <div className="border-t border-hairline pt-4 flex justify-between items-center text-base">
                  <span className="font-medium text-ink">Total</span>
                  <span className="font-serif text-2xl text-ink font-normal">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/checkout')}
                disabled={isLoading}
                className="w-full h-12 bg-ink text-canvas text-xs uppercase tracking-eyebrow font-medium hover:bg-ink/90 transition-colors flex items-center justify-center gap-2"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="border-t border-hairline pt-4 text-xs text-ink-muted space-y-2">
                <div className="flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-ink" />
                  <span>Free doorstep delivery within 3-5 days</span>
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 text-ink" />
                  <span>7-day easy returns & exchanges</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-ink" />
                  <span>Secure encrypted checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
