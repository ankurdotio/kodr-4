import React from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Package, ArrowRight, Home } from 'lucide-react'

export const OrderConfirmation = ({ order }) => {
  if (!order) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4 text-center">
        <h2 className="font-serif text-3xl text-ink">Order Confirmation</h2>
        <p className="text-xs uppercase tracking-eyebrow text-ink-muted mt-2 mb-6">
          Order placed successfully.
        </p>
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 px-6 py-3 bg-ink text-canvas text-xs uppercase tracking-eyebrow"
        >
          View All Orders
        </Link>
      </div>
    )
  }

  const formatPrice = (amount, currency = 'INR') => {
    if (currency === 'INR') {
      return `₹${Number(amount || 0).toLocaleString('en-IN')}`
    }
    return `${currency} ${Number(amount || 0).toFixed(2)}`
  }

  const orderDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      {/* Success Banner */}
      <div className="text-center mb-12">
        <div className="inline-flex p-3 bg-positive/10 text-positive rounded-full mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <span className="text-xs uppercase tracking-eyebrow text-positive font-medium block">
          Order Confirmed
        </span>
        <h1 className="font-serif text-4xl md:text-5xl text-ink font-normal mt-1">
          Thank you for your order
        </h1>
        <p className="text-xs uppercase tracking-eyebrow text-ink-muted mt-2">
          Order ID: #{order._id} · Placed on {orderDate}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {/* Shipping Address */}
        <div className="bg-surface border border-hairline p-6">
          <span className="text-xs uppercase tracking-eyebrow text-ink-muted block mb-2">
            Delivery Address
          </span>
          <p className="text-sm font-medium text-ink">{order.address?.house}</p>
          <p className="text-sm text-ink-muted">{order.address?.street}</p>
          <p className="text-sm text-ink-muted">
            {order.address?.city}, {order.address?.state} - {order.address?.zip}
          </p>
        </div>

        {/* Order Status */}
        <div className="bg-surface border border-hairline p-6">
          <span className="text-xs uppercase tracking-eyebrow text-ink-muted block mb-2">
            Status & Delivery
          </span>
          <span className="inline-block px-2.5 py-1 text-xs uppercase tracking-eyebrow font-medium bg-positive/10 text-positive border border-positive/30">
            {order.status || 'PLACED'}
          </span>
          <p className="text-xs text-ink-muted mt-3">
            Expected delivery in 3-5 business days.
          </p>
        </div>

        {/* Total Payment */}
        <div className="bg-surface border border-hairline p-6">
          <span className="text-xs uppercase tracking-eyebrow text-ink-muted block mb-2">
            Payment Total
          </span>
          <span className="font-serif text-2xl text-ink block">
            {formatPrice(order.totalPrice?.amount, order.totalPrice?.currency)}
          </span>
          <p className="text-xs text-ink-muted mt-2">
            Pay on Delivery / Standard Invoice
          </p>
        </div>
      </div>

      {/* Ordered Products */}
      <div className="bg-surface border border-hairline p-6 sm:p-8 mb-12">
        <h3 className="font-serif text-xl text-ink border-b border-hairline pb-4 mb-6">
          Items in this Order
        </h3>
        <div className="divide-y divide-hairline">
          {order.products?.map((item, idx) => (
            <div key={idx} className="py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={
                    item.product?.image ||
                    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80'
                  }
                  alt={item.product?.title}
                  className="w-16 h-20 object-cover bg-canvas border border-hairline"
                />
                <div>
                  <h4 className="font-serif text-base text-ink">{item.product?.title}</h4>
                  <p className="text-xs text-ink-muted mt-1">
                    Size: {item.size} · Quantity: {item.quantity}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {formatPrice(item.product?.price?.amount, item.product?.price?.currency)} each
                  </p>
                </div>
              </div>
              <span className="text-sm font-medium text-ink">
                {formatPrice(
                  (item.product?.price?.amount || 0) * item.quantity,
                  item.product?.price?.currency
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to="/"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 border border-hairline text-ink text-xs uppercase tracking-eyebrow hover:border-ink transition-colors"
        >
          <Home className="w-4 h-4" />
          Continue Shopping
        </Link>
        <Link
          to="/orders"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-ink text-canvas text-xs uppercase tracking-eyebrow font-medium hover:bg-ink/90 transition-colors"
        >
          <Package className="w-4 h-4" />
          View All Orders
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
