import React from 'react'
import { Link } from 'react-router-dom'
import { Package, XCircle, ArrowRight } from 'lucide-react'

export const OrderHistoryList = ({
  orders = [],
  isLoading = false,
  error = null,
  onCancelOrder,
}) => {
  const formatPrice = (amount, currency = 'INR') => {
    if (currency === 'INR') {
      return `₹${Number(amount || 0).toLocaleString('en-IN')}`
    }
    return `${currency} ${Number(amount || 0).toFixed(2)}`
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-positive/10 text-positive border-positive/30'
      case 'SHIPPED':
        return 'bg-sand/30 text-ink border-sand'
      case 'CANCELLED':
        return 'bg-critical/10 text-critical border-critical/30'
      case 'PLACED':
      default:
        return 'bg-ink/5 text-ink border-hairline'
    }
  }

  if (isLoading) {
    return (
      <div className="py-16 text-center">
        <span className="inline-block animate-spin border-2 border-ink border-t-transparent rounded-full w-8 h-8" />
        <p className="text-xs uppercase tracking-eyebrow text-ink-muted mt-4">
          Loading your order history...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-hairline pb-6">
        <span className="text-xs uppercase tracking-eyebrow text-ink-muted">Account</span>
        <h1 className="font-serif text-3xl md:text-4xl text-ink font-normal mt-1">
          Order History ({orders.length})
        </h1>
      </div>

      {error && (
        <div className="p-4 bg-critical/10 border border-critical text-critical text-xs">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="py-20 text-center border border-hairline bg-surface p-8 max-w-lg mx-auto">
          <Package className="w-12 h-12 text-ink-muted mx-auto mb-4 stroke-1" />
          <h3 className="font-serif text-2xl text-ink mb-2">No Orders Placed Yet</h3>
          <p className="text-xs uppercase tracking-eyebrow text-ink-muted mb-6">
            When you purchase items from our catalog, your receipts and order tracking will appear here.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-ink text-canvas text-xs uppercase tracking-eyebrow font-medium"
          >
            Start Shopping
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const canCancel = order.status === 'PLACED'
            const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })

            return (
              <div
                key={order._id}
                className="bg-surface border border-hairline p-6 sm:p-8 space-y-6 transition-all"
              >
                {/* Order Top Meta */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-hairline text-xs">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-medium text-ink">Order #{order._id}</span>
                    <span className="text-ink-muted">·</span>
                    <span className="text-ink-muted">{formattedDate}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-1 text-[10px] uppercase tracking-eyebrow font-medium border ${getStatusBadgeClass(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                    {canCancel && (
                      <button
                        type="button"
                        onClick={() => onCancelOrder(order._id)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-[11px] text-critical border border-critical/30 hover:bg-critical/10 transition-colors uppercase tracking-eyebrow"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>

                {/* Products in this order */}
                <div className="divide-y divide-hairline">
                  {order.products?.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            item.product?.image ||
                            'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80'
                          }
                          alt={item.product?.title}
                          className="w-12 h-14 object-cover bg-canvas border border-hairline"
                        />
                        <div>
                          <span className="font-medium text-sm text-ink block line-clamp-1">
                            {item.product?.title}
                          </span>
                          <span className="text-xs text-ink-muted">
                            Size: {item.size} · Quantity: {item.quantity}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-ink">
                        {formatPrice(
                          (item.product?.price?.amount || 0) * item.quantity,
                          item.product?.price?.currency
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer Address & Price */}
                <div className="pt-4 border-t border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-ink-muted">
                  <div>
                    <span className="block uppercase tracking-eyebrow text-[10px] text-ink font-medium">
                      Delivering to:
                    </span>
                    <span>
                      {order.address?.house}, {order.address?.street}, {order.address?.city},{' '}
                      {order.address?.state} - {order.address?.zip}
                    </span>
                  </div>
                  <div className="sm:text-right">
                    <span className="block uppercase tracking-eyebrow text-[10px] text-ink font-medium">
                      Total Paid:
                    </span>
                    <span className="font-serif text-lg text-ink font-normal">
                      {formatPrice(order.totalPrice?.amount, order.totalPrice?.currency)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
