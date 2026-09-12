import React from 'react'

export const SellerOrdersList = ({
  orders = [],
  isLoading = false,
  error = null,
  onUpdateStatus,
}) => {
  const formatPrice = (amount, currency = 'INR') => {
    if (currency === 'INR') {
      return `₹${Number(amount || 0).toLocaleString('en-IN')}`
    }
    return `${currency} ${Number(amount || 0).toFixed(2)}`
  }

  const getStatusBadge = (status) => {
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
          Loading store orders...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-hairline pb-4">
        <h2 className="font-serif text-2xl text-ink">Store Customer Orders</h2>
        <p className="text-xs text-ink-muted mt-1">
          Review incoming buyer orders, fulfill shipments, and update logistics statuses.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-critical/10 border border-critical text-critical text-xs">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="py-16 text-center border border-hairline bg-surface p-8">
          <p className="text-sm text-ink-muted">No orders found.</p>
        </div>
      ) : (
        <div className="border border-hairline bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-canvas border-b border-hairline uppercase tracking-eyebrow text-ink-muted text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 font-medium">Order ID / Date</th>
                  <th className="py-3.5 px-4 font-medium">Items</th>
                  <th className="py-3.5 px-4 font-medium">Total</th>
                  <th className="py-3.5 px-4 font-medium">Destination</th>
                  <th className="py-3.5 px-4 font-medium">Status</th>
                  <th className="py-3.5 px-4 font-medium text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline text-ink">
                {orders.map((order) => {
                  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })

                  return (
                    <tr key={order._id} className="hover:bg-canvas/50 transition-colors">
                      <td className="py-4 px-4 align-top">
                        <span className="font-medium text-ink block">#{order._id.slice(-6)}</span>
                        <span className="text-[11px] text-ink-muted">{formattedDate}</span>
                      </td>

                      <td className="py-4 px-4 align-top">
                        <div className="space-y-1">
                          {order.products?.map((p, i) => (
                            <div key={i} className="text-xs">
                              <span className="font-medium">{p.product?.title}</span>
                              <span className="text-ink-muted text-[11px] block">
                                Size: {p.size} · Qty: {p.quantity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="py-4 px-4 font-medium align-top">
                        {formatPrice(order.totalPrice?.amount, order.totalPrice?.currency)}
                      </td>

                      <td className="py-4 px-4 align-top text-xs text-ink-muted max-w-xs">
                        <span>
                          {order.address?.house}, {order.address?.street}, {order.address?.city}
                        </span>
                        <span className="block text-[11px]">
                          {order.address?.state} - {order.address?.zip}
                        </span>
                      </td>

                      <td className="py-4 px-4 align-top">
                        <span
                          className={`inline-block px-2.5 py-1 text-[10px] uppercase tracking-eyebrow font-medium border ${getStatusBadge(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right align-top">
                        <select
                          value={order.status}
                          disabled={['DELIVERED', 'CANCELLED'].includes(order.status)}
                          onChange={(e) => onUpdateStatus(order._id, e.target.value)}
                          className="bg-canvas border border-hairline px-2 py-1 text-xs text-ink uppercase tracking-eyebrow focus:outline-none focus:border-ink disabled:opacity-50"
                        >
                          <option value="PLACED">PLACED</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
