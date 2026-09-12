import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { closeCartDrawer } from '../../../app/uiSlice'
import { useCart } from '../hooks/useCart'
import { CartItem } from './CartItem'
import { Link, useNavigate } from 'react-router-dom'
import { X, ShoppingBag, ArrowRight } from 'lucide-react'

export const CartDrawer = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isCartDrawerOpen } = useSelector((state) => state.ui)
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

  if (!isCartDrawerOpen) return null

  const handleClose = () => {
    dispatch(closeCartDrawer())
  }

  const handleGoToCheckout = () => {
    handleClose()
    navigate('/checkout')
  }

  const handleGoToBag = () => {
    handleClose()
    navigate('/bag')
  }

  const formatPrice = (amount) => {
    return `₹${Number(amount || 0).toLocaleString('en-IN')}`
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-ink/50 backdrop-blur-xs transition-opacity animate-fadeIn"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-canvas border-l border-hairline shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-hairline flex items-center justify-between bg-surface">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-ink" />
              <h2 className="font-serif text-2xl text-ink font-normal">Shopping Bag</h2>
              <span className="text-xs uppercase tracking-eyebrow text-ink-muted">
                ({itemCount})
              </span>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 text-ink-muted hover:text-ink transition-colors"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {error && (
              <div className="mb-4 p-3 bg-critical/10 border border-critical text-critical text-xs">
                {error}
              </div>
            )}

            {items.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-surface border border-hairline flex items-center justify-center mb-4 text-ink-muted">
                  <ShoppingBag className="w-8 h-8 stroke-1" />
                </div>
                <h3 className="font-serif text-2xl text-ink mb-2">Your Bag is Empty</h3>
                <p className="text-xs uppercase tracking-eyebrow text-ink-muted mb-6 max-w-xs">
                  Discover refined menswear crafted for timeless style.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    handleClose()
                    navigate('/products')
                  }}
                  className="px-6 py-3 bg-ink text-canvas text-xs uppercase tracking-eyebrow font-medium hover:bg-ink/90 transition-colors"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <CartItem
                    key={`${item.product?._id || item.product?.id || idx}-${item.size}`}
                    item={item}
                    onIncrement={incrementItem}
                    onDecrement={decrementItem}
                    onRemove={removeItemCompletely}
                    isDrawer={true}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-6 border-t border-hairline bg-surface space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-xs uppercase tracking-eyebrow text-ink-muted">
                  Subtotal
                </span>
                <span className="font-serif text-2xl text-ink font-normal">
                  {formatPrice(totalPrice)}
                </span>
              </div>

              <p className="text-[11px] text-ink-muted">
                Shipping and taxes calculated at checkout. Free shipping on all domestic orders.
              </p>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleGoToCheckout}
                  disabled={isLoading}
                  className="w-full h-12 bg-ink text-canvas text-xs uppercase tracking-eyebrow font-medium hover:bg-ink/90 transition-colors flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleGoToBag}
                  className="w-full h-11 border border-hairline text-ink text-xs uppercase tracking-eyebrow font-medium hover:border-ink transition-colors"
                >
                  View Full Bag
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
