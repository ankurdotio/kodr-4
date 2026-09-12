import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useOrders } from '../features/orders/hooks/useOrders'
import { OrderConfirmation } from '../features/orders/ui/OrderConfirmation'

export const OrderConfirmationPage = () => {
  const { id } = useParams()
  const { orders, currentOrder, loadOrders, isLoading } = useOrders(true)
  const [order, setOrder] = useState(currentOrder || null)

  useEffect(() => {
    if (currentOrder && (currentOrder._id === id || currentOrder.id === id)) {
      setOrder(currentOrder)
    } else if (orders.length > 0) {
      const found = orders.find((o) => o._id === id || o.id === id)
      if (found) setOrder(found)
    } else {
      loadOrders()
    }
  }, [id, currentOrder, orders, loadOrders])

  return <OrderConfirmation order={order} />
}
