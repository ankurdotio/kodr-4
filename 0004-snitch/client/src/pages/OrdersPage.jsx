import React, { useEffect } from 'react'
import { useOrders } from '../features/orders/hooks/useOrders'
import { OrderHistoryList } from '../features/orders/ui/OrderHistoryList'

export const OrdersPage = () => {
  const { orders, isLoading, error, loadOrders, cancelOrder } = useOrders(true)

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <OrderHistoryList
        orders={orders}
        isLoading={isLoading}
        error={error}
        onCancelOrder={cancelOrder}
      />
    </div>
  )
}
